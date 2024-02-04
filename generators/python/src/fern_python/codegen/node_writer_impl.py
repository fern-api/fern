from __future__ import annotations

from . import AST
from .reference_resolver import ReferenceResolver
from .writer_impl import WriterImpl


class NodeWriterImpl(AST.NodeWriter, WriterImpl):
    def __init__(
        self,
        *,
        should_format: bool,
        should_format_as_snippet: bool = False,
        should_include_header: bool = True,
        reference_resolver: ReferenceResolver,
    ):
        super().__init__(
            should_format=should_format,
            should_format_as_snippet=should_format_as_snippet,
            should_include_header=should_include_header,
        )
        self._reference_resolver = reference_resolver

    def write_node(self, node: AST.AstNode) -> None:
        node.write(writer=self)

    def write_reference(self, reference: AST.Reference, is_string_reference: bool = False) -> None:
        content = self._reference_resolver.resolve_reference(reference)
        if is_string_reference:
            content = f'"{content}"'
        self.write(content)

    def should_format_as_snippet(self) -> bool:
        return self._should_format_as_snippet
