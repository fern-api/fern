from typing import List, Set

from ..ast_node import AstNode, NodeWriter, ReferenceResolver
from ..class_ import ClassReference
from ..reference import Reference


class ClassTypeHint(AstNode):
    _reference: ClassReference
    _type_parameters: List[AstNode]

    def __init__(self, reference: ClassReference, type_parameters: List[AstNode] = []):
        self._reference = reference
        self._type_parameters = type_parameters

    def get_references(self) -> Set[Reference]:
        return {self._reference}

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(reference_resolver.resolve_reference(self._reference))
        if len(self._type_parameters) > 0:
            writer.write("[")
            for i, type_parameter in enumerate(self._type_parameters):
                type_parameter.write(writer=writer, reference_resolver=reference_resolver)
                if i < len(self._type_parameters) - 1:
                    writer.write(", ")
            writer.write("]")
