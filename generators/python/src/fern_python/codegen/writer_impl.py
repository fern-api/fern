from __future__ import annotations

import errno
import os
from types import TracebackType
from typing import Optional, Type

from . import AST

TAB_LENGTH = 4
DEFAULT_LINE_LENGTH = 120
SNIPPET_LINE_LENGTH = 80


class WriterImpl(AST.Writer):
    def __init__(
        self,
        *,
        should_format: bool,
        should_sort_imports: bool,
        should_format_as_snippet: bool = False,
        whitelabel: bool = False,
        should_include_header: bool = True,
    ):
        self._indent = 0
        self._whitelabel = whitelabel
        self._has_written_anything = False
        self._last_character_is_newline = False
        self._content = ""
        self._should_format = should_format
        self._should_format_as_snippet = should_format_as_snippet
        self._line_length = SNIPPET_LINE_LENGTH if should_format_as_snippet else DEFAULT_LINE_LENGTH
        self._should_include_header = should_include_header
        self._should_sort_imports = should_sort_imports

    def size(self) -> int:
        return len(self._content)

    def write(self, content: str) -> None:
        # Replace all tabs in the content with spaces
        content = content.replace("\t", " " * TAB_LENGTH)

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
        return " " * TAB_LENGTH * self._indent

    def _write(self, content: str) -> None:
        if len(content) > 0:
            self._has_written_anything = True
            self._last_character_is_newline = content[-1] == "\n"
        self._content += content

    def write_line(self, content: str = "") -> None:
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

    def to_str(self) -> str:
        content = self._content

        if not self._should_sort_imports:
            content = "# isort: skip_file\n\n" + content

        if self._should_format_as_snippet:
            import black
            import isort

            try:
                if self._should_sort_imports:
                    content = isort.code(self._content, quiet=True)

                content = black.format_file_contents(
                    content,
                    fast=True,
                    # todo read their config?
                    mode=black.FileMode(
                        magic_trailing_comma=self._should_format_as_snippet, line_length=self._line_length
                    ),
                )
            except black.report.NothingChanged:
                pass
            except Exception as e:
                print("Failed to format", e)
                pass

        if self._should_include_header:
            if self._whitelabel:
                content = "# This file was auto-generated from our API Definition.\n\n" + content
            else:
                content = "# This file was auto-generated by Fern from our API Definition.\n\n" + content

        return content

    def write_to_file(self, filepath: str) -> None:
        mkdir_p(os.path.dirname(filepath))
        with open(filepath, "w") as file:
            file.write(self.to_str())

    def outdent(self) -> None:
        self._indent = max(0, self._indent - 1)


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
