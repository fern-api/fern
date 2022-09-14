from fern_python.codegen import AST
from fern_python.declaration_handler import (
    DeclarationHandler,
    DeclarationHandlerContext,
)
from fern_python.generated import ir_types


class TypeDeclarationHandler(DeclarationHandler[ir_types.TypeDeclaration]):
    def run(self) -> None:
        self._declaration.shape._visit(
            visitor=ShapeGenerator(
                declaration=self._declaration,
                context=self._context,
            )
        )


class ShapeGenerator(ir_types.Type._Visitor[None]):
    def __init__(self, declaration: ir_types.TypeDeclaration, context: DeclarationHandlerContext) -> None:
        self._declaration = declaration
        self._context = context

    def alias(self, value: ir_types.AliasTypeDeclaration) -> None:
        self._context.source_file.add_type_alias(
            AST.TypeAlias(
                name=self._declaration.name.name,
                type_hint=self._context.get_type_hint_for_type_reference(value.alias_of),
            )
        )

    def enum(self, value: ir_types.EnumTypeDeclaration) -> None:
        pass

    def object(self, value: ir_types.ObjectTypeDeclaration) -> None:
        pass

    def union(self, value: ir_types.UnionTypeDeclaration) -> None:
        pass
