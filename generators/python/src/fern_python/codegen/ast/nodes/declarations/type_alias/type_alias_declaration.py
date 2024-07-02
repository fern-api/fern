from typing import Optional, Set

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ....references import Reference
from ...type_hint import TypeHint


class TypeAliasDeclaration(AstNode):
    def __init__(self, name: str, type_hint: TypeHint, snippet: Optional[str] = None):
        self.name = name
        self.type_hint = type_hint
        self.snippet = snippet
        self.ghost_references: Set[Reference] = set()

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        metadata.update(self.type_hint.get_metadata())
        metadata.references.update(self.ghost_references)
        return metadata

    def add_ghost_reference(self, reference: Reference) -> None:
        self.ghost_references.add(reference)

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if self.snippet is not None:
            writer.write_line('"""')
            writer.write(self.snippet)
            writer.write_newline_if_last_line_not()
            writer.write_line('"""')

        writer.write(f"{self.name} = ")
        self.type_hint.write(writer=writer)
        writer.write_newline_if_last_line_not()
