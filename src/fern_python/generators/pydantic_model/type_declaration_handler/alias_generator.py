import fern.ir.pydantic as ir_types

from fern_python.codegen import AST, SourceFile

from ..context import PydanticGeneratorContext
from ..custom_config import CustomConfig
from ..fern_aware_pydantic_model import FernAwarePydanticModel
from .abstract_type_generator import AbstractTypeGenerator


class AliasGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        alias: ir_types.AliasTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: CustomConfig,
    ):
        super().__init__(
            name=name,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
        )
        self._alias = alias

    def generate(
        self,
    ) -> None:
        with FernAwarePydanticModel(
            type_name=self._name,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
        ) as pydantic_model:
            pydantic_model.set_root_type(self._alias.alias_of)
            pydantic_model.add_method(
                name=self._get_getter_name(self._alias.alias_of),
                parameters=[],
                return_type=self._alias.alias_of,
                body=AST.CodeWriter("return self.__root__"),
            )
            pydantic_model.add_method(
                name=self._get_builder_name(self._alias.alias_of),
                parameters=[("value", self._alias.alias_of)],
                return_type=ir_types.TypeReference.factory.named(self._name),
                body=AST.CodeWriter(f"return {pydantic_model.get_class_name()}(__root__=value)"),
            )

    def _get_builder_name(self, alias_of: ir_types.TypeReference) -> str:
        return alias_of.visit(
            container=lambda container: container.visit(
                list=lambda x: "from_list",
                map=lambda x: "from_map",
                set=lambda x: "from_set",
                optional=self._get_getter_name,
            ),
            named=lambda type_name: "from_" + type_name.name_v_2.camel_case,
            primitive=lambda primitive: primitive.visit(
                integer=lambda: "from_int",
                double=lambda: "from_float",
                string=lambda: "from_str",
                boolean=lambda: "from_bool",
                long=lambda: "from_int",
                date_time=lambda: "from_datetime",
                uuid=lambda: "from_uuid",
            ),
            unknown=lambda: "from",
            void=lambda: "from",
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
