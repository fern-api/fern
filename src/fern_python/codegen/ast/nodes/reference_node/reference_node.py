from typing import Set

from ...ast_node import AstNode, GenericTypeVar, NodeWriter
from ...references import Reference


class ReferenceNode(AstNode):
    def __init__(self, reference: Reference):
        self._reference = reference

    def get_references(self) -> Set[Reference]:
        return {self._reference}

    def get_generics(self) -> Set[GenericTypeVar]:
        return set()

    def write(self, writer: NodeWriter) -> None:
        writer.write_reference(self._reference)
