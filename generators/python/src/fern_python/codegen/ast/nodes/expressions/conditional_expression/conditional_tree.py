from dataclasses import dataclass
from typing import List, Optional

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expression import Expression


@dataclass
class IfConditionLeaf:
    condition: Expression
    code: List[AstNode]


class ConditionalTree(AstNode):
    conditions: List[IfConditionLeaf]
    else_code: Optional[List[AstNode]]

    def __init__(self, conditions: List[IfConditionLeaf], else_code: Optional[List[AstNode]]) -> None:
        self.conditions = conditions
        self.else_code = else_code

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        for condition in self.conditions:
            metadata.update(condition.condition.get_metadata())
            for node in condition.code:
                metadata.update(node.get_metadata())

        if self.else_code is not None:
            for node in self.else_code:
                metadata.update(node.get_metadata())

        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        for i, condition in enumerate(self.conditions):
            writer.write("if " if i == 0 else "elif ")
            writer.write_node(condition.condition)
            writer.write(":")
            with writer.indent():
                for node in condition.code:
                    writer.write_node(node)
                    writer.write_newline_if_last_line_not()
        if self.else_code is not None:
            writer.write("else:")
            with writer.indent():
                for node in self.else_code:
                    writer.write_node(node)
                    writer.write_newline_if_last_line_not()
