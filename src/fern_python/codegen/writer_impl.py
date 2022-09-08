from __future__ import annotations

import errno
import os
from types import TracebackType
from typing import IO, Any, Optional, Type

from . import AST


class WriterImpl(AST.Writer):
    _reference_resolver: AST.ReferenceResolver
    _file: IO[Any]
    _indent: int = 0

    def __init__(self, filepath: str, reference_resolver: AST.ReferenceResolver):
        self._reference_resolver = reference_resolver
        mkdir_p(os.path.dirname(filepath))
        self._file = open(filepath, "w")

    def write(self, content: str) -> None:
        self._file.write("\t" * self._indent + content)

    def write_line(self, content: str) -> None:
        self.write(content)
        if not content.endswith("\n"):
            self.write("\n")

    def write_node(self, node: AST.AstNode) -> None:
        node.write(writer=self, reference_resolver=self._reference_resolver)

    def indent(self) -> IndentableWriterImpl:
        """
        with writer.indent():
            writer.write_line("# here's an indented line")
        """
        self._indent += 1
        return IndentableWriterImpl(writer=self)

    def close(self) -> None:
        self._file.close()

    def outdent(self) -> None:
        self._indent = max(0, self._indent - 1)

    def __enter__(self) -> WriterImpl:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.close()


class IndentableWriterImpl(AST.IndentableWriter):
    _writer: AST.Writer

    def __init__(self, writer: AST.Writer):
        self._writer = writer

    def __enter__(self) -> None:
        pass

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self._writer.outdent()


# Taken from https://stackoverflow.com/a/600612/119527
def mkdir_p(path: str) -> None:
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise
