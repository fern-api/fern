from typing import List, Set

from jinja2 import Template

from ..ast_node import AstNode, ReferenceResolver, Writer
from ..reference import Reference
from .function_parameter import FunctionParameter
from .jinja_utils import get_references_from_jinja_template, write_jinja_template


class ClassConstructor(AstNode):
    parameters: List[FunctionParameter]
    body: Template

    def __init__(self, parameters: List[FunctionParameter], body: Template):
        self.parameters = parameters
        self.body = body

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references = references.union(parameter.get_references())
        references = references.union(get_references_from_jinja_template(self.body))
        return references

    def write(self, writer: Writer, reference_resolver: ReferenceResolver) -> None:
        writer.write("def __init__(self, ")
        for i, parameter in enumerate(self.parameters):
            writer.write_node(parameter)
            if i < len(self.parameters) - 1:
                writer.write(", ")
        writer.write("):")

        with writer.indent():
            write_jinja_template(template=self.body, writer=writer, reference_resolver=reference_resolver)
