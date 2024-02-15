from __future__ import annotations

from ...ast_node import AstNodeMetadata
from ..code_writer import CodeWriter


class Docstring(CodeWriter):
    def get_metadata(self) -> AstNodeMetadata:
        # docstrings shouldn't be analyzed
        return AstNodeMetadata()
