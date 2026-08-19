from __future__ import annotations

from typing import Optional

from ...ast_node import AstNodeMetadata, NodeWriter
from ..code_writer import CodeWriter


def escape_docstring(text: str) -> str:
    """
    Escape special characters in docstrings to avoid syntax errors.
    - Backslashes are escaped to prevent invalid escape sequences (e.g., FOO\\_BAR).
    - Triple quotes are escaped to prevent premature docstring termination when
      descriptions contain code examples with triple-quoted strings.
    """
    result = text.replace("\\", "\\\\")
    result = result.replace('"""', '\\"""')
    return result


class Docstring(CodeWriter):
    def get_metadata(self) -> AstNodeMetadata:
        # docstrings shouldn't be analyzed
        return AstNodeMetadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._code_writer, str):
            writer.write(escape_docstring(self._code_writer))
        else:
            self._code_writer(writer=writer)
