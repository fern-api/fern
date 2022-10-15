from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...type_hint import TypeHint


class TypeAliasDeclaration(AstNode):
    def __init__(self, name: str, type_hint: TypeHint):
        self.name = name
        self.type_hint = type_hint

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.declarations.add(self.name)
        metadata.update(self.type_hint.get_metadata())
        return metadata

    def write(self, writer: NodeWriter) -> None:
        writer.write(f"{self.name} = ")
        self.type_hint.write(writer=writer)
