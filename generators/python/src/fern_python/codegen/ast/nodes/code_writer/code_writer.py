from typing import Optional, Union

from typing_extensions import Protocol

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from .metadata_loading_node_writer import MetadataLoadingNodeWriter


class CodeWriterFunction(Protocol):
    def __call__(
        self,
        writer: NodeWriter,
    ) -> None:
        ...


class CodeWriter(AstNode):
    def __init__(self, code_writer: Union[CodeWriterFunction, str]):
        self._code_writer = code_writer

    def get_metadata(self) -> AstNodeMetadata:
        if isinstance(self._code_writer, str):
            return AstNodeMetadata()
        writer = MetadataLoadingNodeWriter()
        self._code_writer(writer=writer)
        return writer.metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._code_writer, str):
            writer.write(self._code_writer)
        else:
            self._code_writer(writer=writer)
