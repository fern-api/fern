from __future__ import annotations

from typing import Optional, Sequence

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from .except_handler import ExceptHandler


class TryStatement(AstNode):
    """
    Represents a Python 'try' statement with except, else, and finally blocks.

    Example:
    ```python
    try:
        risky_operation()
    except ValueError as e:
        handle_value_error(e)
    except KeyError:
        handle_key_error()
    else:
        no_exceptions_raised()
    finally:
        cleanup()
    ```
    """

    def __init__(
        self,
        body: Sequence[AstNode],
        handlers: Optional[Sequence[ExceptHandler]] = None,
        else_body: Optional[Sequence[AstNode]] = None,
        finally_body: Optional[Sequence[AstNode]] = None,
    ):
        self.body = list(body)
        self.handlers = list(handlers) if handlers is not None else []
        self.else_body = list(else_body) if else_body is not None else []
        self.finally_body = list(finally_body) if finally_body is not None else []

        # Validate that we have at least one of handlers or finally_body
        if not self.handlers and not self.finally_body:
            raise ValueError("Try statement must have at least one except handler or a finally block")

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()

        for statement in self.body:
            metadata.update(statement.get_metadata())
        for handler in self.handlers:
            metadata.update(handler.get_metadata())
        for statement in self.else_body:
            metadata.update(statement.get_metadata())
        for statement in self.finally_body:
            metadata.update(statement.get_metadata())

        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        # Write the try block
        writer.write("try:")
        writer.write_line()

        with writer.indent():
            if self.body:
                for statement in self.body:
                    writer.write_node(statement)
            else:
                writer.write_line("pass")

        # Write all except handlers
        for handler in self.handlers:
            writer.write_node(handler)

        # Write the else block if it exists
        if self.else_body:
            writer.write("else:")
            writer.write_line()

            with writer.indent():
                for statement in self.else_body:
                    writer.write_node(statement)

        # Write the finally block if it exists
        if self.finally_body:
            writer.write("finally:")
            writer.write_line()

            with writer.indent():
                for statement in self.finally_body:
                    writer.write_node(statement)
