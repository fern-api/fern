from abc import ABC, abstractmethod
from typing import Set, Union

from .ast_node import AstNode, NodeWriter, ReferenceResolver
from .reference import Reference


class ReferenceLoader(ReferenceResolver):
    """
    A dummy reference resolver that keeps track of all references that were
    encountered.
    """

    _references: Set[Reference] = set()

    def resolve_reference(self, reference: Reference) -> str:
        self._references.add(reference)
        return "<UNRESOLVED REFERENCE>"

    def get_references(self) -> Set[Reference]:
        return self._references


class ReferencingCodeWriter(ABC):
    @abstractmethod
    def write(self, reference_resolver: ReferenceResolver) -> str:
        ...


class CodeWriter(AstNode):
    _code_writer: Union[ReferencingCodeWriter, str]

    def __init__(self, code_writer: Union[ReferencingCodeWriter, str]):
        self._code_writer = code_writer

    def get_references(self) -> Set[Reference]:
        if isinstance(self._code_writer, str):
            return set()
        reference_loader = ReferenceLoader()
        self._code_writer.write(reference_resolver=reference_loader)
        return reference_loader.get_references()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        if isinstance(self._code_writer, str):
            writer.write(self._code_writer)
        else:
            writer.write(self._code_writer.write(reference_resolver))
