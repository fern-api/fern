from __future__ import annotations

from abc import abstractmethod
from typing import Optional

from ..references import Reference
from .writer import Writer


class NodeWriter(Writer):
    @abstractmethod
    def write_node(self, node: AstNode, should_write_as_snippet: Optional[bool] = None) -> None:
        ...

    @abstractmethod
    def write_reference(self, reference: Reference) -> None:
        ...

    @abstractmethod
    def should_format_as_snippet(self) -> bool:
        ...


from .ast_node import AstNode  # noqa: E402
