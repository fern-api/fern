from __future__ import annotations

from typing import Optional, Union

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference
from ..expression import Expression


class AwaitExpression(Expression):
    def __init__(
        self,
        expression: Union[Expression, AstNode, Reference, str],
    ):
        self.expression: Expression = Expression(expression) if isinstance(expression, (AstNode, Reference, str)) else expression

    def get_metadata(self) -> AstNodeMetadata:
        return self.expression.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("await ")
        self.expression.write(writer=writer)
