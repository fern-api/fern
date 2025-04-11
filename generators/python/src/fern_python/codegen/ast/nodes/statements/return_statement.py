from __future__ import annotations

from typing import Optional, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...references import Reference
from ..expressions.expression import Expression


class ReturnStatement(AstNode):
    def __init__(
        self,
        value: Optional[Union[Expression, AstNode, Reference, str]] = None,
    ):
        self.value = Expression(value) if value is not None and isinstance(value, (AstNode, Reference, str)) else value

    def get_metadata(self) -> AstNodeMetadata:
        if self.value is None:
            return AstNodeMetadata()
        return self.value.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("return")
        if self.value is not None:
            writer.write(" ")
            self.value.write(writer=writer)
        writer.write_newline_if_last_line_not()
