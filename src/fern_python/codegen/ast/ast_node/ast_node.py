from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Set

from ..references import Reference
from .generic_type_var import GenericTypeVar
from .reference_resolver import ReferenceResolver


class AstNode(ABC):
    @abstractmethod
    def get_references(self) -> Set[Reference]:
        ...

    @abstractmethod
    def get_generics(self) -> Set[GenericTypeVar]:
        ...

    @abstractmethod
    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
        ...


from .node_writer import NodeWriter  # noqa: E402
