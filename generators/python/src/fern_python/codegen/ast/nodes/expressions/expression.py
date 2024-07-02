from __future__ import annotations

from enum import Enum
from typing import Optional, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...references import Reference
from ..code_writer import CodeWriter


class Expression(AstNode):
    def __init__(
        self,
        expression: Union[AstNode, Reference, str],
        spread: Optional[ExpressionSpread] = None,
    ):
        self.expression = CodeWriter(expression) if isinstance(expression, str) else expression
        self.spread = spread

    def get_metadata(self) -> AstNodeMetadata:
        if isinstance(self, str):
            return AstNodeMetadata()
        if isinstance(self.expression, Reference):
            metadata = AstNodeMetadata()
            metadata.references.add(self.expression)
            return metadata
        if isinstance(self.expression, AstNode):
            return self.expression.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.spread is not None:
            writer.write(self.spread.value)
        if isinstance(self.expression, Reference):
            writer.write_reference(self.expression)
        else:
            self.expression.write(writer=writer)


class ExpressionSpread(Enum):
    ONE_ASTERISK = "*"
    TWO_ASTERISKS = "**"
