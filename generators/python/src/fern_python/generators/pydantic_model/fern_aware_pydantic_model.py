from __future__ import annotations

from types import TracebackType
from typing import List, Optional, Sequence, Tuple, Type

import fern.ir.resources as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from ..context import PydanticGeneratorContext
from .custom_config import PydanticModelCustomConfig
from .validators import PydanticValidatorsGenerator, ValidatorsGenerator


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
        include_model_config: Optional[bool] = True,
        force_update_forward_refs: bool = False,
    ):
        self._class_name = class_name
        self._type_name = type_name
        self._context = context
        self._custom_config = custom_config
        self._source_file = source_file
        self._extends = extends
        self._force_update_forward_refs = force_update_forward_refs

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
            pydantic_base_model=self._context.core_utilities.get_unchecked_pydantic_base_model(),
            require_optional_fields=custom_config.require_optional_fields,
            is_pydantic_v2=self._context.core_utilities.get_is_pydantic_v2(),
            universal_field_validator=self._context.core_utilities.universal_field_validator,
            universal_root_validator=self._context.core_utilities.universal_root_validator,
            include_model_config=include_model_config,
            update_forward_ref_function_reference=self._context.core_utilities.get_update_forward_refs(),
        )

        self._model_contains_forward_refs = False

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
        union = type_reference.get_as_union()
        if default_value is None:
            if union.type == "container" and union.container.get_as_union().type == "literal":
                container = union.container.get_as_union()
                if container is not None and container.type == "literal":
                    literal = container.literal.get_as_union()
                    if literal.type == "string":
                        default_value = AST.Expression(f'"{literal.string}"')
                    else:
                        default_value = AST.Expression(f"{literal.boolean}")
            else:
                resolved_tr = type_reference
                if union.type == "container":
                    container = union.container.get_as_union()
                    if container.type == "optional":
                        resolved_tr = container.optional
                default_value = self._context.get_initializer_for_type_reference(resolved_tr)

        field = self._create_pydantic_field(
            name=name,
            pascal_case_field_name=pascal_case_field_name,
            json_field_name=json_field_name,
            type_reference=type_reference,
            description=description,
            default_value=default_value,
        )
        self._pydantic_model.add_field(field)
        return field

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

    def _must_import_after_current_declaration(self, type_name: ir_types.DeclaredTypeName) -> bool:
        if self._type_name is None:
            return False
        is_circular_reference = self._context.do_types_reference_each_other(self._type_name.type_id, type_name.type_id)
        if is_circular_reference:
            self._model_contains_forward_refs = True
        return is_circular_reference

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

    def add_ghost_reference(self, type_id: ir_types.TypeId) -> None:
        self._pydantic_model.add_ghost_reference(
            self.get_class_reference_for_type_id(type_id),
        )

    def finish(self) -> None:
        if self._custom_config.include_validators:
            self._pydantic_model.add_partial_class()
            self._get_validators_generator().add_validators()
        if self._model_contains_forward_refs or self._force_update_forward_refs:
            self._pydantic_model.update_forward_refs()
        self._pydantic_model.finish()

    def _get_validators_generator(self) -> ValidatorsGenerator:
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
