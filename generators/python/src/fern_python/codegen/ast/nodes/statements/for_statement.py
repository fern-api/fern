from __future__ import annotations

from typing import Optional, Sequence, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expressions.expression import Expression


class ForStatement(AstNode):
    """
    Represents a Python 'for' statement.

    Example:
    ```python
    for item in items:
        process(item)
    ```

    Async for loop:
    ```python
    async for item in async_items:
        await process(item)
    ```
    """

    def __init__(
        self,
        target: Union[str, Expression],
        iterable: Union[Expression, str],
        body: Sequence[AstNode],
        is_async: bool = False,
    ):
        self.target = target if isinstance(target, Expression) else Expression(target)
        self.iterable = iterable if isinstance(iterable, Expression) else Expression(iterable)
        self.body = list(body)
        self.is_async = is_async

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()

        metadata.update(self.target.get_metadata())
        metadata.update(self.iterable.get_metadata())
        for statement in self.body:
            metadata.update(statement.get_metadata())

        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.is_async:
            writer.write("async for ")
        else:
            writer.write("for ")

        writer.write_node(self.target)
        writer.write(" in ")
        writer.write_node(self.iterable)

        writer.write(":")
        writer.write_line()

        with writer.indent():
            if self.body:
                for statement in self.body:
                    writer.write_node(statement)
            else:
                writer.write_line("pass")
