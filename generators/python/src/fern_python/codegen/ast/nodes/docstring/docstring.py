from __future__ import annotations

from typing import Optional

from ...ast_node import AstNodeMetadata, NodeWriter
from ..code_writer import CodeWriter


def escape_docstring(text: str) -> str:
    """
    Escape backslashes in docstrings to avoid SyntaxWarning for invalid escape sequences.
    This is needed when docstrings contain raw text from OpenAPI specs that may have
    backslashes (e.g., OTHER\_GIFT\_CARD).
    """
    return text.replace("\\", "\\\\")


class Docstring(CodeWriter):
    def get_metadata(self) -> AstNodeMetadata:
        # docstrings shouldn't be analyzed
        return AstNodeMetadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._code_writer, str):
            writer.write(escape_docstring(self._code_writer))
        else:
            self._code_writer(writer=writer)
