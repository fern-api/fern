from typing import Optional

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expression import Expression


class ConditionalExpression(AstNode):
    def __init__(self, test: Expression, left: AstNode, right: AstNode) -> None:
        self.test = test
        self.left = left
        self.right = right

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.update(self.test.get_metadata())
        metadata.update(self.left.get_metadata())
        metadata.update(self.right.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write_node(self.left)
        writer.write(" if ")
        writer.write_node(self.test)
        writer.write(" else ")
        writer.write_node(self.right)
        writer.write_newline_if_last_line_not()
