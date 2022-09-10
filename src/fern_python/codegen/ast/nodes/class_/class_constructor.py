from typing import List, Set

from ...ast_node import AstNode, NodeWriter, ReferenceResolver
from ...reference import Reference
from ..code_writer import CodeWriter, get_references_from_code_writer, run_code_writer
from ..function import FunctionParameter


class ClassConstructor(AstNode):
    parameters: List[FunctionParameter]
    body: CodeWriter

    def __init__(self, parameters: List[FunctionParameter], body: CodeWriter):
        self.parameters = parameters
        self.body = body

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references = references.union(parameter.get_references())
        references = references.union(get_references_from_code_writer(self.body))
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write("def __init__(self, ")
        for i, parameter in enumerate(self.parameters):
            writer.write_node(parameter)
            if i < len(self.parameters) - 1:
                writer.write(", ")
        writer.write("):")

        with writer.indent():
            body_str = run_code_writer(code_writer=self.body, reference_resolver=reference_resolver)
            writer.write(body_str)
