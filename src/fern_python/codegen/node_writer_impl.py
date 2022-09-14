from __future__ import annotations

from . import AST
from .writer_impl import WriterImpl


class NodeWriterImpl(AST.NodeWriter, WriterImpl):
    def __init__(self, filepath: str, reference_resolver: AST.ReferenceResolver):
        super().__init__(filepath)
        self._reference_resolver = reference_resolver

    def write_node(self, node: AST.AstNode) -> None:
        node.write(writer=self, reference_resolver=self._reference_resolver)

    def __enter__(self) -> NodeWriterImpl:
        super().__enter__()
        return self
