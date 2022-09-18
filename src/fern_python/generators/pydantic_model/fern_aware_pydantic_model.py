from typing import Sequence, Tuple

from fern_python.codegen import AST
from fern_python.declaration_handler import (
    DeclarationHandlerContext,
    HashableDeclaredTypeName,
)
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticModel


class FernAwarePydanticModel:
    """
    A Fern-aware class for generating a Pydantic model class.

    Methods should _not_ take AST.TypeHint's, but rather the original Fern
    types.  This is because certain type hints need to be imported below the
    class to avoid issues with circular references. For each type hint. we need
    the original TypeReference to determine if that's necessary.
    """

    def __init__(
        self,
        context: DeclarationHandlerContext,
        type_name: ir_types.DeclaredTypeName,
        extends: Sequence[ir_types.DeclaredTypeName] = None,
    ):
        self._type_name = type_name
        self._context = context
        self._pydantic_model = PydanticModel(
            name=self.get_name_of_pydantic_model(),
            base_models=[context.get_class_reference_for_type_name(extended) for extended in extends]
            if extends is not None
            else None,
        )
        self._model_contains_forward_refs = False

    def get_name_of_pydantic_model(self) -> str:
        return self._type_name.name

    def add_field(self, name: str, json_field_name: str, type_reference: ir_types.TypeReference) -> None:
        self._pydantic_model.add_field(
            name=name,
            type_hint=self._get_type_hint_for_type_reference(
                type_reference,
            ),
            json_field_name=json_field_name,
        )

    def _get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
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
                        name=parameter_name, type_hint=self._get_type_hint_for_type_reference(parameter_type)
                    )
                    for parameter_name, parameter_type in parameters
                ],
                return_type=self._get_type_hint_for_type_reference(return_type),
                body=body,
            ),
            is_static=is_static,
        )

    def add_to_source_file(self) -> None:
        class_declaration = self._pydantic_model.finish()
        self._context.source_file.add_declaration(declaration=class_declaration)
        if self._model_contains_forward_refs:
            self._context.source_file.add_footer_expression(
                AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        qualified_name_excluding_import=(
                            self.get_name_of_pydantic_model(),
                            "updateForwardRefs",
                        )
                    )
                )
            )
