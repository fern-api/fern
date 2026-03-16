from __future__ import annotations

from typing import Optional

from ...ast_node import AstNodeMetadata, NodeWriter
from ..code_writer import CodeWriter


def escape_docstring(text: str) -> str:
    """
    Escape special sequences in docstrings to avoid syntax errors.

    Handles two cases:
    1. Backslashes: source text like FOO\\_BAR would otherwise produce invalid escape sequences.
    2. Triple quotes: descriptions containing \\"\\"\\" (e.g., Python code examples with docstrings)
       would prematurely close the enclosing docstring delimiters.
    """
    text = text.replace("\\", "\\\\")
    text = text.replace('"""', '\\"""')
    return text


class Docstring(CodeWriter):
    def get_metadata(self) -> AstNodeMetadata:
        # docstrings shouldn't be analyzed
        return AstNodeMetadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._code_writer, str):
            writer.write(escape_docstring(self._code_writer))
        else:
            self._code_writer(writer=writer)
