from typing import Sequence, Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import Reference
from ...code_writer import CodeWriter
from ...type_hint import TypeHint
from .function_parameter import FunctionParameter


class FunctionDeclaration(AstNode):
    def __init__(self, name: str, parameters: Sequence[FunctionParameter], return_type: TypeHint, body: CodeWriter):
        self.name = name
        self.parameters = parameters
        self.return_type = return_type
        self.body = body

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references.update(parameter.get_references())
        references.update(self.return_type.get_references())
        references.update(self.body.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        for parameter in self.parameters:
            generics.update(parameter.get_generics())
        generics.update(self.return_type.get_generics())
        generics.update(self.body.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"def {self.name}(")
        for i, parameter in enumerate(self.parameters):
            writer.write_node(parameter)
            writer.write(", ")
        writer.write(") -> ")
        writer.write_node(self.return_type)
        writer.write(":")

        with writer.indent():
            self.body.write(writer=writer, reference_resolver=reference_resolver)
        writer.write_newline_if_last_line_not()
