from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.external_dependencies.pydantic import Pydantic
from fern_python.generators.pydantic_model.fern_aware_pydantic_model import (
    FernAwarePydanticModel,
)
from fern_python.generators.pydantic_model.type_declaration_handler.type_utilities import (
    declared_type_name_to_named_type,
)
from fern_python.snippet import SnippetWriter

from ....context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..alias_generator import AbstractAliasGenerator, AbstractAliasSnippetGenerator


class PydanticModelAliasGenerator(AbstractAliasGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        alias: ir_types.AliasTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
    ):
        super().__init__(
            name=name,
            alias=alias,
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
        )

    def generate(
        self,
    ) -> None:
        if not self._custom_config.wrapped_aliases:
            self._source_file.add_declaration(
                declaration=AST.TypeAliasDeclaration(
                    name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=False),
                    type_hint=self._type_hint,
                    snippet=self._snippet,
                ),
                should_export=True,
            )
        else:
            BUILDER_PARAMETER_NAME = "value"
            is_pydantic_v2 = self._custom_config.version == "v2"
            type_hint = self._context.get_type_hint_for_type_reference(self._alias.alias_of)
            with FernAwarePydanticModel(
                class_name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=False),
                type_name=self._name,
                context=self._context,
                custom_config=self._custom_config,
                source_file=self._source_file,
                docstring=self._docs,
                snippet=self._snippet,
                is_root_model=True,
                base_models=[Pydantic.RootModel(type_hint)] if is_pydantic_v2 else [],
            ) as pydantic_model:
                root_name = "root" if is_pydantic_v2 else "__root__"
                pydantic_model.set_root_type(self._alias.alias_of)
                pydantic_model.add_method(
                    name=self._get_getter_name(self._alias.alias_of),
                    parameters=[],
                    return_type=self._alias.alias_of,
                    body=AST.CodeWriter(f"return self.{root_name}"),
                )
                pydantic_model.add_method(
                    name=self._get_builder_name(self._alias.alias_of),
                    parameters=[(BUILDER_PARAMETER_NAME, self._alias.alias_of)],
                    return_type=ir_types.TypeReference.factory.named(declared_type_name_to_named_type(self._name)),
                    body=AST.CodeWriter(
                        f"return {pydantic_model.get_class_name()}({root_name}={BUILDER_PARAMETER_NAME})"
                    ),
                    decorator=AST.ClassMethodDecorator.STATIC,
                )

    def _get_builder_name(self, alias_of: ir_types.TypeReference) -> str:
        return alias_of.visit(
            container=lambda container: container.visit(
                list_=lambda _: "from_list",
                map_=lambda _: "from_map",
                set_=lambda _: "from_set",
                optional=self._get_builder_name,
                literal=lambda _: "from_string",
            ),
            named=lambda type_name: "from_" + type_name.name.snake_case.unsafe_name,
            primitive=lambda primitive: primitive.v_1.visit(
                integer=lambda: "from_int",
                double=lambda: "from_float",
                string=lambda: "from_str",
                boolean=lambda: "from_bool",
                long_=lambda: "from_int",
                date_time=lambda: "from_datetime",
                date=lambda: "from_date",
                uuid_=lambda: "from_uuid",
                base_64=lambda: "from_str",
                big_integer=lambda: "from_str",
                uint=lambda: "from_int",
                uint_64=lambda: "from_int",
                float_=lambda: "from_float",
            ),
            unknown=lambda: "from_",
        )

    def _get_getter_name(self, alias_of: ir_types.TypeReference) -> str:
        return alias_of.visit(
            container=lambda container: container.visit(
                list_=lambda _: "get_as_list",
                map_=lambda _: "get_as_map",
                set_=lambda _: "get_as_set",
                optional=self._get_getter_name,
                literal=lambda _: "get_as_string",
            ),
            named=lambda type_name: "get_as_" + type_name.name.snake_case.unsafe_name,
            primitive=lambda primitive: primitive.v_1.visit(
                integer=lambda: "get_as_int",
                double=lambda: "get_as_float",
                string=lambda: "get_as_str",
                boolean=lambda: "get_as_bool",
                long_=lambda: "get_as_int",
                date_time=lambda: "get_as_datetime",
                date=lambda: "get_as_date",
                uuid_=lambda: "get_as_uuid",
                base_64=lambda: "get_as_str",
                big_integer=lambda: "get_as_str",
                uint=lambda: "get_as_int",
                uint_64=lambda: "get_as_int",
                float_=lambda: "get_as_float",
            ),
            unknown=lambda: "get_value",
        )


class PydanticModelAliasSnippetGenerator(AbstractAliasSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        example: ir_types.ExampleAliasType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            example=example,
            use_typeddict_request=False,
            as_request=False,
        )

    # generate_snippet delegates to the parent class AliasSnippetGenerator
