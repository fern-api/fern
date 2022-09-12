from typing import List, Set

from ..ast_node import AstNode, NodeWriter, ReferenceResolver
from ..code_writer import CodeWriter
from ..reference import Reference
from ..type_hint import TypeHint
from .function_parameter import FunctionParameter


class FunctionDeclaration(AstNode):
    name: str
    parameters: List[FunctionParameter]
    return_type: TypeHint
    body: CodeWriter

    def __init__(self, name: str, return_type: TypeHint, parameters: List[FunctionParameter], body: CodeWriter):
        self.name = name
        self.parameters = parameters
        self.return_type = return_type
        self.body = body

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references = references.union(parameter.get_references())
        references = references.union(self.body.get_references())
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"def {self.name}(")
        for i, parameter in enumerate(self.parameters):
            writer.write_node(parameter)
            if i < len(self.parameters) - 1:
                writer.write(", ")
        writer.write(") -> ")
        writer.write_node(self.return_type)
        writer.write(":")

        with writer.indent():
            self.body.write(writer=writer, reference_resolver=reference_resolver)
