from __future__ import annotations

import errno
import os
from pathlib import Path
from types import TracebackType
from typing import IO, Any, Optional, Type

import black
import isort

from . import AST


class WriterImpl(AST.Writer):
    def __init__(self, filepath: str):
        self._filepath = filepath
        self._indent = 0
        self._file: IO[Any]
        self._has_written_anything = False
        self._last_character_is_newline = False

    def write(self, content: str) -> None:
        content_ends_in_newline = len(content) > 0 and content[-1] == "\n"

        # temporarily remove the trailing newline, since we don't want to add the prefix after it
        content_without_trailing_newline = content[:-1] if content_ends_in_newline else content

        # indent all lines
        indent = self._get_indent_str()
        indented_content = content_without_trailing_newline.replace("\n", f"\n{indent}")
        if self._is_at_start_of_line():
            indented_content = indent + indented_content
        if content_ends_in_newline:
            indented_content += "\n"

        self._write(indented_content)

    def _is_at_start_of_line(self) -> bool:
        return self._last_character_is_newline or not self._has_written_anything

    def _get_indent_str(self) -> str:
        return "\t" * self._indent

    def _write(self, content: str) -> None:
        if len(content) > 0:
            self._has_written_anything = True
            self._last_character_is_newline = content[-1] == "\n"
        self._file.write(content)

    def write_line(self, content: str) -> None:
        self.write(content)
        self.write_newline_if_last_line_not()

    def write_newline_if_last_line_not(self) -> None:
        if not self._last_character_is_newline:
            self.write("\n")

    def indent(self) -> IndentableWriterImpl:
        """
        with writer.indent():
            writer.write_line("# here's an indented line")
        """
        self._indent += 1

        # ensure the cursor is indented properly
        if self._last_character_is_newline:
            self._write(self._get_indent_str())
        else:
            self.write("\n")

        return IndentableWriterImpl(writer=self)

    def start(self) -> None:
        mkdir_p(os.path.dirname(self._filepath))
        self._file = open(self._filepath, "w")

    def finish(self) -> None:
        self._file.close()
        path = Path(os.path.join(os.getcwd(), self._filepath))
        isort.file(path, quiet=True)
        black.format_file_in_place(
            path,
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
