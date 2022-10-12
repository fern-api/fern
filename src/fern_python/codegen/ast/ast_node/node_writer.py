from __future__ import annotations

from abc import abstractmethod

from ..references import Reference
from .writer import Writer


class NodeWriter(Writer):
    @abstractmethod
    def write_node(self, node: AstNode) -> None:
        ...

    @abstractmethod
    def write_reference(self, reference: Reference) -> None:
        ...


from .ast_node import AstNode  # noqa: E402
