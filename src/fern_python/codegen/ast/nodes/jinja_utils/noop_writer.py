from types import TracebackType
from typing import Optional, Type

from ...ast_node import AstNode, IndentableWriter, Writer


class NoopWriter(Writer):
    def write(self, content: str) -> None:
        pass

    def write_line(self, content: str) -> None:
        pass

    def write_node(self, node: AstNode) -> None:
        pass

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
