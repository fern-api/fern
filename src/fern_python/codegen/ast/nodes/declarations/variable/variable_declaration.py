from typing import Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter
from ....references import Reference
from ...expressions import Expression
from ...type_hint import TypeHint


class VariableDeclaration(AstNode):
    def __init__(self, name: str, type_hint: TypeHint = None, initializer: Expression = None):
        self.name = name
        self.type_hint = type_hint
        self.initializer = initializer

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references.update(self.type_hint.get_references())
        if self.initializer is not None:
            references.update(self.initializer.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        if self.type_hint is not None:
            generics.update(self.type_hint.get_generics())
        if self.initializer is not None:
            generics.update(self.initializer.get_generics())
        return generics

    def write(self, writer: NodeWriter) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer is not None:
            writer.write(" = ")
            self.initializer.write(writer=writer)
        writer.write_line()
