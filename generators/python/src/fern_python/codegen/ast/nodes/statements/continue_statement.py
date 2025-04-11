from __future__ import annotations

from typing import Optional

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter


class ContinueStatement(AstNode):
    """
    Represents a Python 'continue' statement.

    Example:
    ```python
    for i in range(10):
        if i % 2 == 0:
            continue
        process(i)
    ```
    """

    def get_metadata(self) -> AstNodeMetadata:
        return AstNodeMetadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write_line("continue")
