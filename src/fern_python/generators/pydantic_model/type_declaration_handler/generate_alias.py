from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from ..fern_aware_pydantic_model import FernAwarePydanticModel


def generate_alias(
    name: ir_types.DeclaredTypeName, alias: ir_types.AliasTypeDeclaration, context: DeclarationHandlerContext
) -> None:
    with FernAwarePydanticModel(
        type_name=name,
        context=context,
    ) as pydantic_model:
        pydantic_model.set_root_type(alias.alias_of)
        pydantic_model.add_method(
            name=get_getter_name(alias.alias_of),
            parameters=[],
            return_type=alias.alias_of,
            body=AST.CodeWriter("return self.__root__"),
        )


def get_getter_name(alias_of: ir_types.TypeReference) -> str:
    return alias_of.visit(
        container=lambda container: container.visit(
            list=lambda x: "get_as_list",
            map=lambda x: "get_as_map",
            set=lambda x: "get_as_set",
            optional=get_getter_name,
        ),
        named=lambda type_name: "get_as_" + type_name.name_v_2.camel_case,
        primitive=lambda primitive: primitive.visit(
            integer=lambda: "get_as_int",
            double=lambda: "get_as_float",
            string=lambda: "get_as_str",
            boolean=lambda: "get_as_bool",
            long=lambda: "get_as_int",
            date_time=lambda: "get_as_datetime",
            uuid=lambda: "get_as_uuid",
        ),
        unknown=lambda: "get_value",
        void=lambda: "get_value",
    )
