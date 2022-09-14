from typing import List, Set

from ...ast_node import AstNode, NodeWriter, ReferenceResolver
from ...references import ClassReference, Reference


class ClassTypeHint(AstNode):
    def __init__(self, reference: ClassReference, type_parameters: List[AstNode] = None):
        self._reference = reference
        self._type_parameters = type_parameters or []

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        references.add(self._reference)
        for type_parameter in self._type_parameters:
            references.update(type_parameter.get_references())
        return references

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        writer.write(reference_resolver.resolve_reference(self._reference))
        if len(self._type_parameters) > 0:
            writer.write("[")
            for i, type_parameter in enumerate(self._type_parameters):
                type_parameter.write(writer=writer, reference_resolver=reference_resolver)
                if i < len(self._type_parameters) - 1:
                    writer.write(", ")
            writer.write("]")
