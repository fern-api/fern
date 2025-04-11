from __future__ import annotations

from typing import Optional, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expressions.expression import Expression


class YieldStatement(AstNode):
    """
    Represents a Python 'yield' statement.

    Examples:
    ```python
    yield 42
    yield x + y
    yield from generator
    ```
    """

    def __init__(self, value: Optional[Union[Expression, AstNode, str]] = None, is_yield_from: bool = False):
        self.value = value if value is None or isinstance(value, Expression) else Expression(value)
        self.is_yield_from = is_yield_from

    def get_metadata(self) -> AstNodeMetadata:
        if self.value is not None:
            return self.value.get_metadata()
        return AstNodeMetadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.is_yield_from:
            writer.write("yield from ")
        else:
            writer.write("yield")

        if self.value is not None:
            if not self.is_yield_from:
                writer.write(" ")
            writer.write_node(self.value)

        writer.write_newline_if_last_line_not()
