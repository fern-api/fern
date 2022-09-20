from typing import Protocol, Set, Union

from ...ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ...references import Reference
from .reference_loading_node_writer import ReferenceLoadingNodeWriter
from .reference_loading_reference_resolver import ReferenceLoadingReferenceResolver


class ReferencingCodeWriter(Protocol):
    def __call__(
        self,
        writer: NodeWriter,
        reference_resolver: ReferenceResolver,
    ) -> None:
        ...


class CodeWriter(AstNode):
    def __init__(self, code_writer: Union[ReferencingCodeWriter, str]):
        self._code_writer = code_writer

    def get_references(self) -> Set[Reference]:
        if isinstance(self._code_writer, str):
            return set()
        writer = ReferenceLoadingNodeWriter()
        reference_loader = ReferenceLoadingReferenceResolver()
        self._code_writer(writer=writer, reference_resolver=reference_loader)
        return writer.references.union(reference_loader.references)

    def get_generics(self) -> Set[GenericTypeVar]:
        if isinstance(self._code_writer, str):
            return set()
        writer = ReferenceLoadingNodeWriter()
        reference_loader = ReferenceLoadingReferenceResolver()
        self._code_writer(writer=writer, reference_resolver=reference_loader)
        return writer.generics.union(reference_loader.generics)

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        if isinstance(self._code_writer, str):
            writer.write(self._code_writer)
        else:
            self._code_writer(reference_resolver=reference_resolver, writer=writer)
