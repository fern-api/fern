from typing import Optional, Set

from ..ast_node import AstNode, NodeWriter, ReferenceResolver
from ..reference import Reference
from .code_writer import CodeWriter, get_references_from_code_writer, run_code_writer
from .type_hint import TypeHint


class VariableDeclaration(AstNode):
    name: str
    type_hint: Optional[TypeHint]
    initializer: Optional[CodeWriter]

    def __init__(self, name: str, type_hint: Optional[TypeHint] = None, initializer: CodeWriter = None):
        self.name = name
        self.type_hint = type_hint
        self.initializer = initializer

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if self.type_hint is not None:
            references = references.union(self.type_hint.get_references())
        if self.initializer is not None:
            references = references.union(get_references_from_code_writer(self.initializer))
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer is not None:
            initializer_str = run_code_writer(code_writer=self.initializer, reference_resolver=reference_resolver)
            writer.write(" = " + initializer_str)
