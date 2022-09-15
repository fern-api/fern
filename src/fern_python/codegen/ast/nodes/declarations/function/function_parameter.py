from typing import Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import Reference
from ...type_hint import TypeHint


class FunctionParameter(AstNode):
    def __init__(self, name: str, type_hint: TypeHint = None):
        self.name = name
        self.type_hint = type_hint

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references.update(self.type_hint.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        if self.type_hint is not None:
            generics.update(self.type_hint.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
