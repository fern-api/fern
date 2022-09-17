from fern_python.codegen import AST, SourceFile
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticModel

VISITOR_RETURN_TYPE = AST.GenericTypeVar(name="T_Result")


def generate_union(
    name: ir_types.DeclaredTypeName, union: ir_types.UnionTypeDeclaration, source_file: SourceFile
) -> None:
    pydantic_model = PydanticModel(name=name.name)
    for single_union_type in union.types:
        pydantic_model.add_method(
            name=single_union_type.discriminant_value.snake_case,
            parameters=[],
            return_type=AST.TypeHint.none(),
            body=AST.CodeWriter("pass"),
            is_static=True,
        )
    source_file.add_declaration(pydantic_model.finish())
