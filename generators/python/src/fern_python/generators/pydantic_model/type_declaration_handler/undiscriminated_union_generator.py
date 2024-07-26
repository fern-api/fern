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
        maybe_requests_source_file: Optional[SourceFile],
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
            maybe_requests_source_file=maybe_requests_source_file,
        )
        self._name = name
        self._union = union

    def generate(self) -> None:
        self._source_file.add_declaration(
            AST.TypeAliasDeclaration(
                type_hint=AST.TypeHint.union(
                    *(self._context.get_type_hint_for_type_reference(member.type) for member in self._union.members)
                ),
                name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=False),
            ),
            should_export=True,
        )

        if self._maybe_requests_source_file is not None:
            self._maybe_requests_source_file.add_declaration(
                AST.TypeAliasDeclaration(
                    type_hint=AST.TypeHint.union(
                        *(
                            self._context.get_type_hint_for_type_reference(
                                member.type, in_endpoint=True, for_typeddict=True
                            )
                            for member in self._union.members
                        )
                    ),
                    name=self._context.get_class_name_for_type_id(self._name.type_id, as_request=True),
                ),
                should_export=True,
            )


class UndiscriminatedUnionSnippetGenerator:
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleUndiscriminatedUnionType,
        use_typeddict_request: bool,
        as_request: bool,
    ):
        self.snippet_writer = snippet_writer
        self.name = name
        self.example = example
        self.as_request = as_request
        self.use_typeddict_request = use_typeddict_request

    def generate_snippet(self) -> Optional[AST.Expression]:
        return self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=self.example.single_union_type,
            use_typeddict_request=self.use_typeddict_request,
            as_request=self.as_request,
        )
