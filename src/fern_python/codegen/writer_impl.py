from __future__ import annotations

import errno
import os
from pathlib import Path
from types import TracebackType
from typing import IO, Any, Optional, Type

import black

from . import AST


class WriterImpl(AST.Writer):
    def __init__(self, filepath: str):
        self._filepath = filepath
        self._indent = 0
        self._file: IO[Any]

    def write(self, content: str) -> None:
        self._file.write("\t" * self._indent + content)

    def write_line(self, content: str) -> None:
        self.write(content)
        if not content.endswith("\n"):
            self.write("\n")

    def indent(self) -> IndentableWriterImpl:
        """
        with writer.indent():
            writer.write_line("# here's an indented line")
        """
        self._indent += 1
        return IndentableWriterImpl(writer=self)

    def start(self) -> None:
        mkdir_p(os.path.dirname(self._filepath))
        self._file = open(self._filepath, "w")

    def finish(self) -> None:
        self._file.close()
        black.format_file_in_place(
            Path(os.path.join(os.getcwd(), self._filepath)),
            fast=True,
            mode=black.FileMode(),
            write_back=black.WriteBack.YES,
        )

    def outdent(self) -> None:
        self._indent = max(0, self._indent - 1)

    def __enter__(self) -> WriterImpl:
        self.start()
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()


class IndentableWriterImpl(AST.IndentableWriter):
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
