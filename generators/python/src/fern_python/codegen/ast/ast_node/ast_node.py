from __future__ import annotations

from abc import ABC, abstractmethod

from .ast_node_metadata import AstNodeMetadata


class AstNode(ABC):
    @abstractmethod
    def get_metadata(self) -> AstNodeMetadata:
        ...

    @abstractmethod
    def write(self, writer: NodeWriter) -> None:
        ...


from .node_writer import NodeWriter  # noqa: E402
