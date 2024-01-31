from __future__ import annotations

from abc import abstractmethod

from ..references import Reference
from .writer import Writer


class NodeWriter(Writer):
    @abstractmethod
    def write_node(self, node: AstNode) -> None:
        ...

    @abstractmethod
    def write_reference(self, reference: Reference, is_string_reference: bool = False) -> None:
        ...

    @abstractmethod
    def should_format_as_snippet(self) -> bool:
        ...


from .ast_node import AstNode  # noqa: E402
