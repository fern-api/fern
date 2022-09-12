from typing import Optional, Set

from ..ast_node import AstNode, NodeWriter, ReferenceResolver
from ..reference import Reference
from ..type_hint import TypeHint


class FunctionParameter(AstNode):
    name: str
    type_hint: Optional[TypeHint]

    def __init__(self, name: str, type_hint: TypeHint = None):
        self.name = name
        self.type_hint = type_hint

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references = references.union(self.type_hint.get_references())
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
