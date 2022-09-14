from typing import Set

from ...ast_node import AstNode, NodeWriter, ReferenceResolver
from ...references import Reference
from ..code_writer import CodeWriter
from ..type_hint import TypeHint


class VariableDeclaration(AstNode):
    def __init__(self, name: str, type_hint: TypeHint = None, initializer: CodeWriter = None):
        self.name = name
        self.type_hint = type_hint
        self.initializer = initializer

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references = references.union(self.type_hint.get_references())
        if self.initializer is not None:
            references = references.union(self.initializer.get_references())
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer is not None:
            writer.write(" = ")
            self.initializer.write(writer=writer, reference_resolver=reference_resolver)
