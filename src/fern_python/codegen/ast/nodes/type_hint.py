from typing import Set

from ..ast_node import AstNode, ReferenceResolver, Writer
from ..reference import Reference


class TypeHint(AstNode):
    def get_references(self) -> Set[Reference]:
        return set()

    def write(self, writer: Writer, reference_resolver: ReferenceResolver) -> None:
        pass
