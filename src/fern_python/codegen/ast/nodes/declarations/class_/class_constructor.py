from typing import Sequence, Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import Reference
from ...code_writer import CodeWriter
from ..function import FunctionParameter


class ClassConstructor(AstNode):
    def __init__(self, parameters: Sequence[FunctionParameter], body: CodeWriter):
        self.parameters = parameters
        self.body = body

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references.update(parameter.get_references())
        references.update(self.body.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        for parameter in self.parameters:
            generics.update(parameter.get_generics())
        generics.update(self.body.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write("def __init__(self, ")
        for parameter in self.parameters:
            writer.write_node(parameter)
            writer.write(", ")
        writer.write("):")

        with writer.indent():
            self.body.write(writer=writer, reference_resolver=reference_resolver)
