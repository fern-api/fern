from __future__ import annotations

from typing import TYPE_CHECKING, Optional, Sequence, Tuple

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter


class DictionaryInstantiation(AstNode):
    def __init__(
        self,
        entries: Optional[Sequence[Tuple[Expression, Expression]]] = None,
    ):
        self.entries = entries or []

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        for key, value in self.entries:
            metadata.update(key.get_metadata())
            metadata.update(value.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("{")
        for index, (key, value) in enumerate(self.entries):
            if index > 0:
                writer.write(", ")
            writer.write_node(key)
            writer.write(": ")
            writer.write_node(value)
        writer.write("}")


if TYPE_CHECKING:
    from ..expression import Expression
