from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.snippet.snippet_writer import SnippetWriter

from ...context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abstract_type_generator import AbstractTypeGenerator


class UndiscriminatedUnionGenerator(AbstractTypeGenerator):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        union: ir_types.UndiscriminatedUnionTypeDeclaration,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
        as_request: bool = False,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
            as_request=as_request,
        )
        self._name = name
        self._union = union

    def generate(self) -> None:
        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(
                    *(self._context.get_type_hint_for_type_reference(member.type) for member in self._union.members)
                ),
                name=self._name.name.pascal_case.safe_name,
            ),
            should_export=True,
        )


class UndiscriminatedUnionSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleUndiscriminatedUnionType,
    ):
        self.snippet_writer = snippet_writer
        self.name = name
        self.example = example

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.single_union_type,
        )
