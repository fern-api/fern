from __future__ import annotations

from . import AST
from .reference_resolver import ReferenceResolver
from .writer_impl import WriterImpl


class NodeWriterImpl(AST.NodeWriter, WriterImpl):
    def __init__(self, filepath: str, reference_resolver: ReferenceResolver):
        super().__init__(filepath)
        self._reference_resolver = reference_resolver

    def write_node(self, node: AST.AstNode) -> None:
        node.write(writer=self)

    def write_reference(self, reference: AST.Reference) -> None:
        self.write(self._reference_resolver.resolve_reference(reference))

    def __enter__(self) -> NodeWriterImpl:
        super().__enter__()
        return self
