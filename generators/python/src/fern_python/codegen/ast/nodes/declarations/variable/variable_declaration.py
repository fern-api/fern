from typing import Optional

from .....ast.nodes.docstring.docstring import Docstring
from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...expressions import Expression
from ...type_hint import TypeHint


class VariableDeclaration(AstNode):
    def __init__(
        self,
        name: str,
        type_hint: Optional[TypeHint] = None,
        initializer: Optional[Expression] = None,
        docstring: Optional[Docstring] = None,
    ):
        self.name = name
        self.type_hint = type_hint
        self.initializer = initializer
        self.docstring = docstring

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        if self.type_hint is not None:
            metadata.update(self.type_hint.get_metadata())
        if self.initializer is not None:
            metadata.update(self.initializer.get_metadata())
        if self.docstring is not None:
            metadata.update(self.docstring.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write(f"{self.name}")
        if self.type_hint is not None:
            writer.write(": ")
            writer.write_node(self.type_hint)
        if self.initializer is not None:
            writer.write(" = ")
            self.initializer.write(writer=writer)
        writer.write_line()
        if self.docstring is not None:
            writer.write_line('"""')
            writer.write_node(self.docstring)
            writer.write_newline_if_last_line_not()
            writer.write_line('"""')
            writer.write_line()
