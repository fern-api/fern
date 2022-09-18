from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from ..fern_aware_pydantic_model import FernAwarePydanticModel

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


def generate_union(
    name: ir_types.DeclaredTypeName,
    union: ir_types.UnionTypeDeclaration,
    context: DeclarationHandlerContext,
) -> None:
    pydantic_model = FernAwarePydanticModel(type_name=name, context=context)
    for single_union_type in union.types:
        pydantic_model.add_method(
            AST.FunctionDeclaration(
                name=single_union_type.discriminant_value.snake_case,
                parameters=[],
                return_type=AST.TypeHint.none(),
                body=AST.CodeWriter("pass"),
            ),
            is_static=True,
        )
    context.source_file.add_declaration(pydantic_model.finish())
