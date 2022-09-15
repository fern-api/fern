from typing import Protocol, Set, Union

from ...ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ...references import Reference


class ReferenceLoader(ReferenceResolver):
    """
    A dummy reference resolver that keeps track of all references that were
    encountered.
    """

    def __init__(self) -> None:
        self._references: Set[Reference] = set()

    def resolve_reference(self, reference: Reference) -> str:
        self._references.add(reference)
        return "<UNRESOLVED REFERENCE>"

    def get_references(self) -> Set[Reference]:
        return self._references


class ReferencingCodeWriter(Protocol):
    def __call__(self, reference_resolver: ReferenceResolver) -> str:
        ...


class CodeWriter(AstNode):
    def __init__(self, code_writer: Union[ReferencingCodeWriter, str]):
        self._code_writer = code_writer

    def get_references(self) -> Set[Reference]:
        if isinstance(self._code_writer, str):
            return set()
        reference_loader = ReferenceLoader()
        self._code_writer(reference_resolver=reference_loader)
        return reference_loader.get_references()

    def get_generics(self) -> Set[GenericTypeVar]:
        return set()

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        if isinstance(self._code_writer, str):
            writer.write(self._code_writer)
        else:
            writer.write(self._code_writer(reference_resolver))
