from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


class AliasGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        alias: ir_types.AliasTypeDeclaration,
        context: DeclarationHandlerContext,
    ):
        super().__init__(name=name, context=context)
        self._alias = alias

    def generate(
        self,
    ) -> None:
        with FernAwarePydanticModel(
            type_name=self._name,
            context=self._context,
        ) as pydantic_model:
            pydantic_model.set_root_type(self._alias.alias_of)
            pydantic_model.add_method(
                name=self._get_getter_name(self._alias.alias_of),
                parameters=[],
                return_type=self._alias.alias_of,
                body=AST.CodeWriter("return self.__root__"),
            )

    def _get_getter_name(self, alias_of: ir_types.TypeReference) -> str:
        return alias_of.visit(
            container=lambda container: container.visit(
                list=lambda x: "get_as_list",
                map=lambda x: "get_as_map",
                set=lambda x: "get_as_set",
                optional=self._get_getter_name,
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
