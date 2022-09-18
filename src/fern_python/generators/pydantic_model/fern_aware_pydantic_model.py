from typing import Sequence

from fern_python.codegen import AST
from fern_python.declaration_handler import (
    DeclarationHandlerContext,
    HashableDeclaredTypeName,
)
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticModel


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
            name=type_name.name,
            base_models=[context.get_class_reference_for_type_name(extended) for extended in extends]
            if extends is not None
            else None,
        )

    def add_field(self, name: str, json_field_name: str, type_reference: ir_types.TypeReference) -> None:
        self._pydantic_model.add_field(
            name=name,
            type_hint=self._context.get_type_hint_for_type_reference(
                type_reference,
                must_import_after_current_declaration=self._is_type_reference_circular(type_reference),
            ),
            json_field_name=json_field_name,
        )

    def _is_type_reference_circular(self, type_reference: ir_types.TypeReference) -> bool:
        return type_reference._visit(
            container=lambda container: container._visit(
                list=lambda value_type: self._is_type_reference_circular(value_type),
                set=lambda value_type: self._is_type_reference_circular(value_type),
                optional=lambda value_type: self._is_type_reference_circular(value_type),
                map=lambda map_type: self._is_type_reference_circular(map_type.key_type)
                or self._is_type_reference_circular(map_type.value_type),
            ),
            named=lambda type_name: HashableDeclaredTypeName.of(type_name)
            in self._context.get_referenced_types(type_name),
            primitive=lambda primitive: False,
            unknown=lambda: False,
            void=lambda: False,
        )

    def add_method(
        self,
        declaration: AST.FunctionDeclaration,
        is_static: bool = False,
    ) -> AST.FunctionDeclaration:
        return self._pydantic_model.add_method(
            declaration=declaration,
            is_static=is_static,
        )

    def finish(self) -> AST.ClassDeclaration:
        return self._pydantic_model.finish()
