from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator


class AliasGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        alias: ir_types.AliasTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        maybe_requests_source_file: Optional[SourceFile],
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            maybe_requests_source_file=maybe_requests_source_file,
            docs=docs,
            snippet=snippet,
        )
        self._name = name
        self._alias = alias

    def generate(
        self,
    ) -> None:
        type_hint = self._context.get_type_hint_for_type_reference(self._alias.alias_of)
        self._source_file.add_declaration(
            declaration=AST.TypeAliasDeclaration(
                name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=False),
                type_hint=type_hint,
                snippet=self._snippet,
            ),
            should_export=True,
        )

        if self._maybe_requests_source_file is not None:
            self._source_file.add_declaration(
                declaration=AST.TypeAliasDeclaration(
                    name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=True),
                    type_hint=type_hint,
                    snippet=self._snippet,
                ),
                should_export=True,
            )


class AliasSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        example: ir_types.ExampleAliasType,
    ):
        self.snippet_writer = snippet_writer
        self.example = example

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.value,
        )
