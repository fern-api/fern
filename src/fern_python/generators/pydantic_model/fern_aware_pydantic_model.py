from __future__ import annotations

from types import TracebackType
from typing import Optional, Sequence, Tuple, Type

from fern_python.codegen import AST, LocalClassReference
from fern_python.declaration_handler import (
    DeclarationHandlerContext,
    HashableDeclaredTypeName,
)
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticField, PydanticModel


class FernAwarePydanticModel:
    def __init__(
        self,
        context: DeclarationHandlerContext,
        type_name: ir_types.DeclaredTypeName,
        extends: Sequence[ir_types.DeclaredTypeName] = None,
    ):
        self._type_name = type_name
        self._context = context
        self._pydantic_model = PydanticModel(
            name=self.get_class_name(),
            source_file=context.source_file,
            base_models=[context.get_class_reference_for_type_name(extended) for extended in extends]
            if extends is not None
            else None,
        )
        self._model_contains_forward_refs = False

    def to_reference(self) -> LocalClassReference:
        return self._pydantic_model.to_reference()

    def get_class_name(self) -> str:
        return self._context.get_class_name_for_type_name(self._type_name)

    def add_field(self, name: str, json_field_name: str, type_reference: ir_types.TypeReference) -> PydanticField:
        field = PydanticField(
            name=name,
            type_hint=self.get_type_hint_for_type_reference(
                type_reference,
            ),
            json_field_name=json_field_name,
        )
        self._pydantic_model.add_field(field)
        return field

    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        return self._context.get_type_hint_for_type_reference(
            type_reference,
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
        is_static: bool = False,
    ) -> AST.FunctionDeclaration:
        return self._pydantic_model.add_method(
            declaration=AST.FunctionDeclaration(
                name=name,
                parameters=[
                    AST.FunctionParameter(
                        name=parameter_name, type_hint=self.get_type_hint_for_type_reference(parameter_type)
                    )
                    for parameter_name, parameter_type in parameters
                ],
                return_type=self.get_type_hint_for_type_reference(return_type),
                body=body,
            ),
            is_static=is_static,
        )

    def add_method_unsafe(self, declaration: AST.FunctionDeclaration) -> None:
        """
        When generating a Pydantic model, certain type hints need to be
        imported below the class to avoid issues with circular references. For each
        type hint. we need the original TypeReference to determine if that's
        necessary. To ensure the imports are done correctly, the non-unsafe
        methods in the class take TypeReference and handle converting the
        TypeReference to a TypeHint.

        If you need to add a method to this class that's already been converted
        to an AST node, you can use add_method_unsafe.

        IMPORTANT: when constructing the FunctionDeclaration, make sure not to
        convert TypeReference's to TypeHint's yourself!  Use the
        get_type_hint_for_type_reference method on this class.
        """
        self._pydantic_model.add_method(declaration=declaration)

    def set_root_type(self, root_type: AST.TypeHint) -> None:
        self._pydantic_model.set_root_type(root_type=root_type)

    def finish(self) -> None:
        self._pydantic_model.finish()
        if self._model_contains_forward_refs:
            self._context.source_file.add_footer_expression(
                AST.Expression(
                    AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(
                                self.get_class_name(),
                                "update_forward_refs",
                            )
                        )
                    )
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
