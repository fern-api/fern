from types import TracebackType
from typing import Optional, Type

from ...ast_node import AstNode, AstNodeMetadata, IndentableWriter, NodeWriter
from ...references import Reference


class MetadataLoadingNodeWriter(NodeWriter):
    def __init__(self) -> None:
        self.metadata = AstNodeMetadata()

    def write(self, content: str) -> None:
        pass

    def write_line(self, content: str = "") -> None:
        pass

    def write_newline_if_last_line_not(self) -> None:
        pass

    def write_node(self, node: AstNode) -> None:
        self.metadata.update(node.get_metadata())

    def write_reference(self, reference: Reference) -> None:
        self.metadata.references.add(reference)

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
