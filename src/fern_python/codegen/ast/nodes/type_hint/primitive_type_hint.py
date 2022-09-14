from enum import Enum
from typing import Set

from ...ast_node import AstNode, NodeWriter, ReferenceResolver
from ...references import Reference


class PrimitiveType(str, Enum):
    str = "str"
    int = "int"
    float = "float"
    bool = "bool"
    none = "None"


class PrimitiveTypeHint(AstNode):
    def __init__(self, primitive: PrimitiveType):
        self._primitive = primitive

    def get_references(self) -> Set[Reference]:
        return set()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(self._primitive)
