from typing import Protocol, Set, Union

from ...ast_node import AstNode, GenericTypeVar, NodeWriter
from ...references import Reference
from .reference_loading_node_writer import ReferenceLoadingNodeWriter


class CodeWriterFunction(Protocol):
    def __call__(
        self,
        writer: NodeWriter,
    ) -> None:
        ...


class CodeWriter(AstNode):
    def __init__(self, code_writer: Union[CodeWriterFunction, str]):
        self._code_writer = code_writer

    def get_references(self) -> Set[Reference]:
        if isinstance(self._code_writer, str):
            return set()
        writer = ReferenceLoadingNodeWriter()
        self._code_writer(writer=writer)
        return writer.references

    def get_generics(self) -> Set[GenericTypeVar]:
        if isinstance(self._code_writer, str):
            return set()
        writer = ReferenceLoadingNodeWriter()
        self._code_writer(writer=writer)
        return writer.generics

    def write(self, writer: NodeWriter) -> None:
        if isinstance(self._code_writer, str):
            writer.write(self._code_writer)
        else:
            self._code_writer(writer=writer)
