from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...references import Reference


class ReferenceNode(AstNode):
    def __init__(self, reference: Reference):
        self._reference = reference

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        metadata.references.add(self._reference)
        return metadata

    def write(self, writer: NodeWriter) -> None:
        writer.write_reference(self._reference)
