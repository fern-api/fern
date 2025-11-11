from typing import Optional

import fern.ir.resources as ir_types
from ....context.pydantic_generator_context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ..alias_generator import AbstractAliasGenerator, AbstractAliasSnippetGenerator

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter


class TypedDictAliasGenerator(AbstractAliasGenerator):
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
        self._source_file.add_declaration(
            declaration=AST.TypeAliasDeclaration(
                name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=True),
                type_hint=self._type_hint,
                snippet=self._snippet,
            ),
            should_export=True,
        )


class TypedDictAliasSnippetGenerator(AbstractAliasSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        example: ir_types.ExampleAliasType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            example=example,
            use_typeddict_request=True,
            as_request=True,
        )

    # generate_snippet delegates to the parent class AbstractAliasSnippetGenerator
