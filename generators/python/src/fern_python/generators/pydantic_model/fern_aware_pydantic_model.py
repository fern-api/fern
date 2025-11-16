from __future__ import annotations

from types import TracebackType
from typing import List, Optional, Sequence, Tuple, Type

from ..context.pydantic_generator_context import PydanticGeneratorContext
from .custom_config import PydanticModelCustomConfig
from .validators import (
    PydanticV1CustomRootTypeValidatorsGenerator,
    PydanticValidatorsGenerator,
    ValidatorsGenerator,
)
from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.external_dependencies.pydantic import PydanticVersionCompatibility
from fern_python.pydantic_codegen import PydanticField, PydanticModel

import fern.ir.resources as ir_types


class FernAwarePydanticModel:
    """
    A pydantic model generator that is aware of the Fern type representations.

    IMPORTANT: when constructing the FunctionDeclaration, make sure not to
    convert TypeReference's to TypeHint's yourself!  Use the
    get_type_hint_for_type_reference method on this class. Read on more for information.

    When generating a Pydantic model, certain type hints need to be
    imported below the class to avoid issues with circular references. For each
    type hint, we need the original TypeReference to determine if that's
    necessary. To ensure the imports are done correctly, the non-unsafe
    methods in the class take TypeReference and handle converting the
    TypeReference to a TypeHint.
    """

    def __init__(
        self,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        class_name: str,
        type_name: Optional[ir_types.DeclaredTypeName],
        should_export: bool = True,
        extends: Sequence[ir_types.DeclaredTypeName] = [],
        base_models: Sequence[AST.ClassReference] = [],
        docstring: Optional[str] = None,
        snippet: Optional[str] = None,
        is_root_model: bool = False,
        # Allow overriding the base model from the unchecked base model, or the typical
        # pydantic base model to the universal root model if needed. This is used instead
        # of `base_models` since that field is used for true `extends` declared within
        # the IR, and used as such when constructing partial classes for validators within FastAPI.
        pydantic_base_model_override: Optional[AST.ClassReference] = None,
        # Since we create new classes for union members, we need to know the original type name
        # to appropriately detect circular imports.
        original_type_id: Optional[ir_types.TypeId] = None,
        # With the addition of __root__ and root definitions conditionally to the Pydantic model
        # when leveraging union utils, we need to update refs to pick up the types.
        force_update_forward_refs: bool = False,
    ):
        self._class_name = class_name
        self._type_name = type_name
        self._original_type_id = original_type_id

        self._context = context
        self._custom_config = custom_config
        self._source_file = source_file
        self._extends = extends

        self._model_contains_forward_refs = False

        models_to_extend = [item for item in base_models] if base_models is not None else []
        extends_crs = (
            [context.get_class_reference_for_type_id(extended.type_id, as_request=False) for extended in extends]
            if extends is not None
            else []
        )

        models_to_extend.extend(extends_crs)
        self._pydantic_model = PydanticModel(
            version=self._custom_config.version,
            name=class_name,
            source_file=source_file,
            should_export=should_export,
            base_models=models_to_extend,
            docstring=docstring,
            snippet=snippet,
            extra_fields="forbid" if custom_config.forbid_extra_fields else custom_config.extra_fields,
            frozen=custom_config.frozen,
            orm_mode=custom_config.orm_mode,
            smart_union=custom_config.smart_union,
            pydantic_base_model=pydantic_base_model_override
            or self._context.core_utilities.get_unchecked_pydantic_base_model(),
            require_optional_fields=custom_config.require_optional_fields,
            is_pydantic_v2=self._context.core_utilities.get_is_pydantic_v2(),
            universal_field_validator=self._context.core_utilities.universal_field_validator,
            universal_root_validator=self._context.core_utilities.universal_root_validator,
            is_root_model=is_root_model,
            update_forward_ref_function_reference=self._context.core_utilities.get_update_forward_refs(),
            field_metadata_getter=lambda: self._context.core_utilities.get_field_metadata(),
            use_pydantic_field_aliases=self._custom_config.use_pydantic_field_aliases,
        )

        self._force_update_forward_refs = force_update_forward_refs
        self._forward_referenced_models: set[ir_types.TypeId] = set()
        self._self_referential_union_member_dependencies: set[ir_types.TypeId] = set()

    def to_reference(self) -> LocalClassReference:
        return self._pydantic_model.to_reference()

    def get_class_name(self) -> str:
        return self._class_name

    def add_field(
        self,
        *,
        name: str,
        pascal_case_field_name: str,
        json_field_name: str,
        type_reference: ir_types.TypeReference,
        description: Optional[str] = None,
        default_value: Optional[AST.Expression] = None,
    ) -> PydanticField:
        if default_value is None:
            default_value = self._context.get_initializer_for_type_reference(type_reference)

        field = self._create_pydantic_field(
            name=name,
            pascal_case_field_name=pascal_case_field_name,
            json_field_name=json_field_name,
            type_reference=type_reference,
            description=description,
            default_value=default_value,
        )
        self._pydantic_model.add_field(field)

        type_ids = self._context.maybe_get_type_ids_for_type_reference(type_reference)
        if type_ids is not None:
            for type_id in type_ids:
                self._add_ghost_references_for_transitive_circular_dependencies(type_id)

        return field

    def _add_ghost_references_for_transitive_circular_dependencies(self, type_id: ir_types.TypeId) -> None:
        if self._custom_config.include_union_utils:
            # If you're using union utils, then your unions should be objects, and so these changes should not be necessary it is possible
            # that we must call update_forward_refs on the union utils class itself, but we'll cross that bridge when we get there
            return

        # Get self-referencing dependencies of the type you are trying to add
        # And add them as ghost references at the bottom of the file
        self_referencing_dependencies_from_non_union_types = (
            self._context.get_non_union_self_referencing_dependencies_from_types()[type_id]
        )
        for dependency in self_referencing_dependencies_from_non_union_types:
            if (
                not self._type_name or self._type_name.type_id != dependency
            ) and dependency not in self._forward_referenced_models:
                self.add_ghost_reference(dependency)

        self_referencing_dependencies_from_union_types = (
            self._context.get_union_self_referencing_members_from_types()
        )[type_id]
        for dependency in self_referencing_dependencies_from_union_types:
            if dependency not in self._forward_referenced_models:
                import dataclasses

                # Force must_import_after_current_declaration=True for union dependencies
                # so their imports appear at bottom before update_forward_refs call
                ghost_ref = dataclasses.replace(
                    self.get_class_reference_for_type_id(dependency), must_import_after_current_declaration=True
                )
                self._pydantic_model.add_ghost_reference(ghost_ref)
                self._self_referential_union_member_dependencies.add(dependency)

    def add_private_instance_field_unsafe(
        self, name: str, type_hint: AST.TypeHint, default_factory: AST.Expression
    ) -> None:
        if default_factory is None:
            return None
        self._pydantic_model.add_private_instance_field(name=name, type_hint=type_hint, default_factory=default_factory)

    def add_class_var_unsafe(self, name: str, type_hint: AST.TypeHint, initializer: AST.Expression) -> None:
        if initializer is None:
            return None
        self._pydantic_model.add_class_var(name, type_hint, initializer=initializer)

    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        return self._context.get_type_hint_for_type_reference(
            type_reference,
            # if the given type references this pydantic model's type, then
            # we have to import it after the current declaration to avoid
            # circular import errors
            must_import_after_current_declaration=self._must_import_after_current_declaration,
        )

    def get_class_reference_for_type_id(self, type_id: ir_types.TypeId) -> AST.ClassReference:
        return self._context.get_class_reference_for_type_id(
            type_id=type_id,
            # if the given type references this pydantic model's type, then
            # we have to import it after the current declaration to avoid
            # circular import errors
            must_import_after_current_declaration=self._must_import_after_current_declaration,
            as_request=False,
        )

    def _type_id_for_forward_ref(self) -> Optional[ir_types.TypeId]:
        type_id_to_reference = None
        if self._type_name is not None:
            type_id_to_reference = self._type_name.type_id
        elif self._original_type_id is not None:
            type_id_to_reference = self._original_type_id

        return type_id_to_reference

    def _must_import_after_current_declaration(self, type_name: ir_types.DeclaredTypeName) -> bool:
        type_id_to_reference = self._type_id_for_forward_ref()
        if type_id_to_reference is None:
            return False

        if self._context.does_type_reference_other_type(type_name.type_id, type_id_to_reference) or (
            self._context.does_circularly_reference_itself(type_name.type_id)
        ):
            self._model_contains_forward_refs = True
            return True

        return False

    def add_method(
        self,
        name: str,
        parameters: Sequence[Tuple[str, ir_types.TypeReference]],
        return_type: ir_types.TypeReference,
        body: AST.CodeWriter,
        decorator: Optional[AST.ClassMethodDecorator] = None,
    ) -> AST.FunctionDeclaration:
        return self.add_method_unsafe(
            declaration=AST.FunctionDeclaration(
                name=name,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=parameter_name, type_hint=self.get_type_hint_for_type_reference(parameter_type)
                        )
                        for parameter_name, parameter_type in parameters
                    ],
                    return_type=self.get_type_hint_for_type_reference(return_type),
                ),
                body=body,
            ),
            decorator=decorator,
        )

    def add_statement(
        self,
        statement: AST.AstNode,
    ) -> None:
        return self._pydantic_model.add_statement(statement)

    def add_method_unsafe(
        self,
        declaration: AST.FunctionDeclaration,
        decorator: Optional[AST.ClassMethodDecorator] = None,
    ) -> AST.FunctionDeclaration:
        return self._pydantic_model.add_method(declaration=declaration, decorator=decorator)

    def set_root_type_v1_or_v2_only(
        self,
        root_type: ir_types.TypeReference,
        annotation: Optional[AST.Expression] = None,
        is_forward_ref: bool = False,
    ) -> None:
        self.set_root_type_unsafe_v1_or_v2_only(
            root_type=self.get_type_hint_for_type_reference(root_type),
            annotation=annotation,
            is_forward_ref=is_forward_ref,
        )

    def set_root_type_unsafe_v1_or_v2_only(
        self, root_type: AST.TypeHint, annotation: Optional[AST.Expression] = None, is_forward_ref: bool = False
    ) -> None:
        if self._custom_config.version not in [
            PydanticVersionCompatibility.V1,
            PydanticVersionCompatibility.V1_ON_V2,
            PydanticVersionCompatibility.V2,
        ]:
            raise RuntimeError("Overriding root types is only available in Pydantic v1, v2 or v1_on_v2 mode")
        self._pydantic_model.set_root_type_unsafe_v1_or_v2_only(root_type=root_type, annotation=annotation)

    def add_ghost_reference(self, type_id: ir_types.TypeId) -> None:
        self._pydantic_model.add_ghost_reference(
            self.get_class_reference_for_type_id(type_id),
        )

    def finish(self) -> None:
        if self._custom_config.include_validators:
            if self._pydantic_model._v1_or_v2_root_type is None and self._custom_config.version in (
                PydanticVersionCompatibility.V1,
                PydanticVersionCompatibility.V1_ON_V2,
                PydanticVersionCompatibility.V2,
            ):
                self._pydantic_model.add_partial_class()
            self._get_validators_generator().add_validators()
        # Handle self-referential union member dependencies specially
        if self._self_referential_union_member_dependencies:
            import dataclasses

            # Force must_import_after_current_declaration=True to ensure these imports
            # go into _import_to_statements_that_must_precede_it and appear at bottom
            ghost_references = [
                dataclasses.replace(
                    self.get_class_reference_for_type_id(dependency_type_id), must_import_after_current_declaration=True
                )
                for dependency_type_id in self._self_referential_union_member_dependencies
            ]
            self._pydantic_model.update_forward_refs_with_ghost_references(ghost_references)
        elif self._model_contains_forward_refs or self._force_update_forward_refs:
            self._pydantic_model.update_forward_refs()

        # Acknowledge forward refs for extended models as well
        for extended_type in self._extends:
            type_id_to_reference = self._type_id_for_forward_ref()
            if type_id_to_reference is not None and self._context.does_type_reference_other_type(
                type_id=extended_type.type_id, other_type_id=type_id_to_reference
            ):
                # While we don't want to string reference the extended model, we still want to rebuild the model
                self._model_contains_forward_refs = True
                break
            self._add_ghost_references_for_transitive_circular_dependencies(extended_type.type_id)

        self._pydantic_model.finish()

    def _get_validators_generator(self) -> ValidatorsGenerator:
        v1_or_v2_root_type = self._pydantic_model.get_root_type_unsafe_v1_or_v2_only()
        if v1_or_v2_root_type is not None and self._custom_config.version in (
            PydanticVersionCompatibility.V1,
            PydanticVersionCompatibility.V1_ON_V2,
            PydanticVersionCompatibility.V2,
        ):
            return PydanticV1CustomRootTypeValidatorsGenerator(
                model=self._pydantic_model,
                root_type=v1_or_v2_root_type,
            )
        else:
            unique_name = []
            if self._type_name is not None:
                unique_name = [path.snake_case.unsafe_name for path in self._type_name.fern_filepath.package_path]
                unique_name.append(self._type_name.name.snake_case.unsafe_name)
            return PydanticValidatorsGenerator(
                model=self._pydantic_model,
                extended_pydantic_fields=self._get_extended_pydantic_fields(self._extends or []),
                unique_name=unique_name,
            )

    def _get_extended_pydantic_fields(self, extends: Sequence[ir_types.DeclaredTypeName]) -> List[PydanticField]:
        extended_fields: List[PydanticField] = []
        for extended in extends:
            extended_declaration = self._context.get_declaration_for_type_id(extended.type_id)
            shape_union = extended_declaration.shape.get_as_union()
            if shape_union.type == "object":
                for property in shape_union.properties:
                    field = self._create_pydantic_field(
                        name=property.name.name.snake_case.safe_name,
                        pascal_case_field_name=property.name.name.pascal_case.safe_name,
                        json_field_name=property.name.wire_value,
                        type_reference=property.value_type,
                        description=property.docs,
                    )
                    extended_fields.append(field)
                extended_fields.extend(self._get_extended_pydantic_fields(shape_union.extends))
        return extended_fields

    def _create_pydantic_field(
        self,
        *,
        name: str,
        pascal_case_field_name: str,
        json_field_name: str,
        type_reference: ir_types.TypeReference,
        description: Optional[str] = None,
        default_value: Optional[AST.Expression] = None,
    ) -> PydanticField:
        type_hint = self.get_type_hint_for_type_reference(type_reference)

        return PydanticField(
            name=name,
            pascal_case_field_name=pascal_case_field_name,
            type_hint=type_hint,
            json_field_name=json_field_name,
            description=description,
            default_value=default_value,
        )

    def __enter__(self) -> FernAwarePydanticModel:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()
