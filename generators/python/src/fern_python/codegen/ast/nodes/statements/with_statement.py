from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Sequence, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expressions.expression import Expression


@dataclass
class WithContextManager:
    """Represents a single context manager in a with statement."""

    expression: Expression
    as_variable: Optional[str] = None

    def __post_init__(self) -> None:
        if not isinstance(self.expression, Expression):
            self.expression = Expression(self.expression)


class WithStatement(AstNode):
    """
    Represents a Python 'with' statement.

    Example:
    ```python
    with open('file.txt') as f:
        do_something()
    ```
    """

    def __init__(
        self,
        context_managers: Union[WithContextManager, Sequence[WithContextManager]],
        body: Sequence[AstNode],
        is_async: bool = False,
    ):
        if isinstance(context_managers, WithContextManager):
            self.context_managers = [context_managers]
        else:
            self.context_managers = list(context_managers)

        self.body = list(body)
        self.is_async = is_async

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()

        for cm in self.context_managers:
            metadata.update(cm.expression.get_metadata())
        for statement in self.body:
            metadata.update(statement.get_metadata())

        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.is_async:
            writer.write("async with ")
        else:
            writer.write("with ")

        # Write the context managers
        for i, cm in enumerate(self.context_managers):
            if i > 0:
                writer.write(", ")

            writer.write_node(cm.expression)

            if cm.as_variable:
                writer.write(f" as {cm.as_variable}")

        writer.write(":")
        writer.write_line()
        with writer.indent():
            if self.body:
                for statement in self.body:
                    writer.write_node(statement)
            else:
                writer.write_line("pass")
