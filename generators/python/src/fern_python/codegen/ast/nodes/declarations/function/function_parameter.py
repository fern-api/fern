from typing import Optional

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...expressions import Expression
from ...type_hint import TypeHint


class FunctionParameter(AstNode):
    def __init__(
        self,
        *,
        name: str,
        docs: Optional[str] = None,
        type_hint: Optional[TypeHint] = None,
        initializer: Optional[Expression] = None,
    ):
        self.name = name
        self.docs = docs
        self.type_hint = type_hint
        self.initializer = initializer

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        if self.type_hint is not None:
            metadata.update(self.type_hint.get_metadata())
        if self.initializer is not None:
            metadata.update(self.initializer.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer is not None:
            writer.write(" = ")
            writer.write_node(self.initializer)
