from __future__ import annotations

from typing import Optional

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
        whitelabel: bool = False,
    ):
        super().__init__(
            should_format=should_format,
            should_format_as_snippet=should_format_as_snippet,
            should_include_header=should_include_header,
            whitelabel=whitelabel,
        )
        self._reference_resolver = reference_resolver

    def write_node(self, node: AST.AstNode, should_write_as_snippet: Optional[bool] = None) -> None:
        node.write(writer=self, should_write_as_snippet=should_write_as_snippet)

    def write_reference(self, reference: AST.Reference) -> None:
        self.write(self._reference_resolver.resolve_reference(reference, self))

    def should_format_as_snippet(self) -> bool:
        return self._should_format_as_snippet
