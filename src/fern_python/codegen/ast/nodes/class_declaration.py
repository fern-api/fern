from typing import List, Optional, Set, Union

from ..ast_node import AstNode, ReferenceResolver, Writer
from ..reference import Reference
from .class_constructor import ClassConstructor
from .class_reference import ClassReference
from .function_declaration import FunctionDeclaration
from .variable_declaration import VariableDeclaration


class ClassDeclaration(AstNode):
    name: str
    extends: List[ClassReference]
    constructor: Optional[ClassConstructor]
    statements: List[Union[VariableDeclaration, FunctionDeclaration]]

    def __init__(self, name: str, extends: List[ClassReference] = []):
        self.name = name
        self.extends = extends
        self.constructor = None
        self.statements = []

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set(self.extends)
        if self.constructor is not None:
            references = references.union(self.constructor.get_references())
        for statement in self.statements:
            references = references.union(statement.get_references())
        return references

    def write(self, writer: Writer, reference_resolver: ReferenceResolver) -> None:
        top_line = f"class {self.name}"
        if len(self.extends) > 0:
            top_line += f"({', '.join(reference_resolver.resolve_reference(r) for r in self.extends)})"
        top_line += ":"
        writer.write_line(top_line)

        with writer.indent():
            writer.write_line("pass")
