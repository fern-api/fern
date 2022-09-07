from typing import Optional, Set

from jinja2 import Template

from ..ast_node import AstNode, ReferenceResolver, Writer
from ..reference import Reference
from .jinja_utils import get_references_from_jinja_template, write_jinja_template
from .type_hint import TypeHint


class VariableDeclaration(AstNode):
    name: str
    type_hint: Optional[TypeHint]
    initializer: Optional[Template]

    def __init__(self, name: str, type_hint: Optional[TypeHint] = None, initializer: Template = None):
        self.name = name
        self.type_hint = type_hint
        self.initializer = initializer

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references = references.union(self.type_hint.get_references())
        if self.initializer is not None:
            references = references.union(get_references_from_jinja_template(self.initializer))
        return references

    def write(self, writer: Writer, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer:
            writer.write(" = ")
            write_jinja_template(template=self.initializer, writer=writer, reference_resolver=reference_resolver)
