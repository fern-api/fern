from types import TracebackType
from typing import Optional, Set, Type

from ...ast_node import AstNode, GenericTypeVar, IndentableWriter, NodeWriter
from ...references import Reference


class ReferenceLoadingNodeWriter(NodeWriter):
    def __init__(self) -> None:
        self.references: Set[Reference] = set()
        self.generics: Set[GenericTypeVar] = set()

    def write(self, content: str) -> None:
        pass

    def write_line(self, content: str = "") -> None:
        pass

    def write_newline_if_last_line_not(self) -> None:
        pass

    def write_node(self, node: AstNode) -> None:
        self.references.update(node.get_references())
        self.generics.update(node.get_generics())

    def indent(self) -> IndentableWriter:
        return NoopIndentableWriter()

    def outdent(self) -> None:
        pass


class NoopIndentableWriter(IndentableWriter):
    def __enter__(self) -> None:
        pass

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        pass
