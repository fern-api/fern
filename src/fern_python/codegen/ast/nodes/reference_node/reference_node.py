from typing import Set

from ...ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ...references import Reference


class ReferenceNode(AstNode):
    def __init__(self, reference: Reference):
        self._reference = reference

    def get_references(self) -> Set[Reference]:
        return {self._reference}

    def get_generics(self) -> Set[GenericTypeVar]:
        return set()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(reference_resolver.resolve_reference(self._reference))
