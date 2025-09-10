from __future__ import annotations

from typing import Optional, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...references import Reference
from ..expressions.expression import Expression


class RaiseStatement(AstNode):
    """
    Represents a Python 'raise' statement.

    Examples:
    ```python
    raise Exception("An error occurred")
    raise ValueError("Invalid value")
    raise
    ```
    """

    def __init__(
        self,
        exception: Optional[Union[Expression, AstNode, Reference, str]] = None,
        cause: Optional[Union[Expression, AstNode, Reference, str]] = None,
    ):
        self.exception = (
            Expression(exception)
            if exception is not None and isinstance(exception, (AstNode, Reference, str))
            else exception
        )
        self.cause = Expression(cause) if cause is not None and isinstance(cause, (AstNode, Reference, str)) else cause

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        if self.exception is not None:
            metadata.update(self.exception.get_metadata())
        if self.cause is not None:
            metadata.update(self.cause.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("raise")

        if self.exception is not None:
            writer.write(" ")
            self.exception.write(writer=writer)

            if self.cause is not None:
                writer.write(" from ")
                self.cause.write(writer=writer)

        writer.write_newline_if_last_line_not()
