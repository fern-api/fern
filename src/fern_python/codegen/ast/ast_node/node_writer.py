from __future__ import annotations

from abc import abstractmethod

from .writer import Writer


class NodeWriter(Writer):
    @abstractmethod
    def write_node(self, node: AstNode) -> None:
        ...


from .ast_node import AstNode  # noqa: E402
