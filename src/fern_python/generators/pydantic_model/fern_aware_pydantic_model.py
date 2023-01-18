from __future__ import annotations

from types import TracebackType
from typing import List, Optional, Sequence, Tuple, Type

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, LocalClassReference, SourceFile
from fern_python.pydantic_codegen import PydanticField, PydanticModel

from .context import HashableDeclaredTypeName, PydanticGeneratorContext
from .custom_config import PydanticModelCustomConfig
from .validators import (
    CustomRootTypeValidatorsGenerator,
    PydanticValidatorsGenerator,
    ValidatorsGenerator,
)


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
        type_name: ir_types.DeclaredTypeName,
        extends: Sequence[ir_types.DeclaredTypeName] = None,
        docstring: Optional[str] = None,
    ):
        self._type_name = type_name
        self._context = context
        self._custom_config = custom_config
        self._source_file = source_file
        self._extends = extends
        self._pydantic_model = PydanticModel(
            name=self.get_class_name(),
            source_file=source_file,
            base_models=[context.get_class_reference_for_type_name(extended) for extended in extends]
            if extends is not None
            else None,
            docstring=docstring,
            forbid_extra_fields=custom_config.forbid_extra_fields,
        )
        self._model_contains_forward_refs = False

    def to_reference(self) -> LocalClassReference:
        return self._pydantic_model.to_reference()

    def get_class_name(self) -> str:
        return self._context.get_class_name_for_type_name(self._type_name)

    def add_field(
        self,
        *,
        name: str,
        pascal_case_field_name: str,
        json_field_name: str,
        type_reference: ir_types.TypeReference,
        description: Optional[str] = None,
    ) -> PydanticField:
        field = self._create_pydantic_field(
            name=name,
            pascal_case_field_name=pascal_case_field_name,
            json_field_name=json_field_name,
            type_reference=type_reference,
            description=description,
        )
        self._pydantic_model.add_field(field)
        return field

    def add_private_instance_field_unsafe(
        self, name: str, type_hint: AST.TypeHint, default_factory: AST.Expression = None
    ) -> None:
        self._pydantic_model.add_private_instance_field(name=name, type_hint=type_hint, default_factory=default_factory)

    def add_class_var_unsafe(self, name: str, type_hint: AST.TypeHint, initializer: AST.Expression = None) -> None:
        self._pydantic_model.add_class_var(name, type_hint, initializer=initializer)

    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        return self._context.get_type_hint_for_type_reference(
            type_reference,
            # if the given type references this pydantic model's type, then
            # we have to import it after the current declaration to avoid
            # circular import errors
            must_import_after_current_declaration=self._must_import_after_current_declaration,
        )

    def get_class_reference_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> AST.ClassReference:
        return self._context.get_class_reference_for_type_name(
            type_name=type_name,
            # if the given type references this pydantic model's type, then
            # we have to import it after the current declaration to avoid
            # circular import errors
            must_import_after_current_declaration=self._must_import_after_current_declaration,
        )

    def _must_import_after_current_declaration(self, type_name: ir_types.DeclaredTypeName) -> bool:
        is_circular_reference = HashableDeclaredTypeName.of(self._type_name) in self._context.get_referenced_types(
            type_name
        )
        if is_circular_reference:
            self._model_contains_forward_refs = True
        return is_circular_reference

    def add_method(
        self,
        name: str,
        parameters: Sequence[Tuple[str, ir_types.TypeReference]],
        return_type: ir_types.TypeReference,
        body: AST.CodeWriter,
        decorator: AST.ClassMethodDecorator = None,
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

    def add_method_unsafe(
        self,
        declaration: AST.FunctionDeclaration,
        decorator: AST.ClassMethodDecorator = None,
    ) -> AST.FunctionDeclaration:
        return self._pydantic_model.add_method(declaration=declaration, decorator=decorator)

    def set_root_type(
        self,
        root_type: ir_types.TypeReference,
        annotation: Optional[AST.Expression] = None,
        is_forward_ref: bool = False,
    ) -> None:
        self.set_root_type_unsafe(
            root_type=self.get_type_hint_for_type_reference(root_type),
            annotation=annotation,
            is_forward_ref=is_forward_ref,
        )

    def set_root_type_unsafe(
        self, root_type: AST.TypeHint, annotation: Optional[AST.Expression] = None, is_forward_ref: bool = False
    ) -> None:
        self._pydantic_model.set_root_type(root_type=root_type, annotation=annotation)
        if is_forward_ref:
            self._model_contains_forward_refs = True

    def add_ghost_reference(self, type_name: ir_types.DeclaredTypeName) -> None:
        self._pydantic_model.add_ghost_reference(
            self.get_class_reference_for_type_name(type_name),
        )

    def finish(self) -> None:
        if self._pydantic_model._root_type is None:
            self._pydantic_model.add_partial_class()
        if self._custom_config.include_validators:
            self._get_validators_generator().add_validators()
        self._override_json()
        self._override_dict()
        if self._model_contains_forward_refs:
            self._pydantic_model.update_forward_refs()
        self._pydantic_model.finish()

    def _get_validators_generator(self) -> ValidatorsGenerator:
        root_type = self._pydantic_model.get_root_type()
        if root_type is not None:
            return CustomRootTypeValidatorsGenerator(
                model=self._pydantic_model,
                root_type=root_type,
            )
        else:
            return PydanticValidatorsGenerator(
                model=self._pydantic_model,
                extended_pydantic_fields=self._get_extended_pydantic_fields(self._extends or []),
            )

    def _get_extended_pydantic_fields(self, extends: Sequence[ir_types.DeclaredTypeName]) -> List[PydanticField]:
        extended_fields: List[PydanticField] = []
        for extended in extends:
            extended_declaration = self._context.get_declaration_for_type_name(extended)
            shape_union = extended_declaration.shape.get_as_union()
            if shape_union.type == "object":
                for property in shape_union.properties:
                    field = self._create_pydantic_field(
                        name=property.name.name.snake_case.unsafe_name,
                        pascal_case_field_name=property.name.name.pascal_case.unsafe_name,
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
    ) -> PydanticField:
        return PydanticField(
            name=name,
            pascal_case_field_name=pascal_case_field_name,
            type_hint=self.get_type_hint_for_type_reference(
                type_reference,
            ),
            json_field_name=json_field_name,
            description=description,
        )

    def _override_json(self) -> None:
        def write_json_body(writer: AST.NodeWriter) -> None:
            writer.write("kwargs_with_defaults: ")
            writer.write_node(AST.TypeHint.any())
            writer.write(' = { "by_alias": True, "exclude_unset": True, **kwargs }')
            writer.write_line()
            writer.write_line("return super().json(**kwargs_with_defaults)")

        self._pydantic_model.add_method(
            AST.FunctionDeclaration(
                name="json",
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint.str_(),
                    include_kwargs=True,
                ),
                body=AST.CodeWriter(write_json_body),
            )
        )

    def _override_dict(self) -> None:
        def write_dict_body(writer: AST.NodeWriter) -> None:
            writer.write("kwargs_with_defaults: ")
            writer.write_node(AST.TypeHint.any())
            writer.write(' = { "by_alias": True, "exclude_unset": True, **kwargs }')
            writer.write_line()
            writer.write_line("return super().dict(**kwargs_with_defaults)")

        self._pydantic_model.add_method(
            AST.FunctionDeclaration(
                name="dict",
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.any()),
                    include_kwargs=True,
                ),
                body=AST.CodeWriter(write_dict_body),
            )
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
