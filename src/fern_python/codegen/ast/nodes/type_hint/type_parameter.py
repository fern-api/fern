from __future__ import annotations

from typing import List, Set, Union

from ...ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ...references import Reference


class TypeParameter(AstNode):
    def __init__(
        self,
        type_parameter: Union[AstNode, GenericTypeVar, List[TypeParameter]],
    ):
        self._type_parameter = type_parameter

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        if isinstance(self._type_parameter, AstNode):
            references.update(self._type_parameter.get_references())
        elif isinstance(self._type_parameter, list):
            for type_parameter in self._type_parameter:
                references.update(type_parameter.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        if isinstance(self._type_parameter, AstNode):
            generics.update(self._type_parameter.get_generics())
        elif isinstance(self._type_parameter, GenericTypeVar):
            generics.add(self._type_parameter)
        elif isinstance(self._type_parameter, list):
            for type_parameter in self._type_parameter:
                generics.update(type_parameter.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        if isinstance(self._type_parameter, AstNode):
            self._type_parameter.write(writer=writer, reference_resolver=reference_resolver)
        elif isinstance(self._type_parameter, GenericTypeVar):
            writer.write(self._type_parameter.name)
        elif isinstance(self._type_parameter, list):
            writer.write("[")
            for i, type_parameter in enumerate(self._type_parameter):
                type_parameter.write(writer=writer, reference_resolver=reference_resolver)
                if i < len(self._type_parameter) - 1:
                    writer.write(", ")
            writer.write("]")
