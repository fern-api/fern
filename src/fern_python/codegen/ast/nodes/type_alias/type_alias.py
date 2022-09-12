from typing import Set

from ...ast_node import AstNode, NodeWriter, ReferenceResolver
from ...references import Reference
from ..type_hint import TypeHint


class TypeAlias(AstNode):
    name: str
    type_hint: TypeHint

    def __init__(self, name: str, type_hint: TypeHint):
        self.name = name
        self.type_hint = type_hint

    def get_references(self) -> Set[Reference]:
        return self.type_hint.get_references()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name} = ")
        self.type_hint.write(writer=writer, reference_resolver=reference_resolver)
