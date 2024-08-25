from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from .ast_node_metadata import AstNodeMetadata


class AstNode(ABC):
    @abstractmethod
    def get_metadata(self) -> AstNodeMetadata:
        ...

    @abstractmethod
    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        ...


from .node_writer import NodeWriter  # noqa: E402
