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
        self.expression = Expression(expression) if isinstance(expression, (AstNode, Reference, str)) else expression

    def get_metadata(self) -> AstNodeMetadata:
        if isinstance(self.expression, Reference):
            metadata = AstNodeMetadata()
            metadata.references.add(self.expression)
            return metadata
        return self.expression.get_metadata()

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("await ")
        if isinstance(self.expression, Reference):
            writer.write_reference(self.expression)
        else:
            self.expression.write(writer=writer)
