from __future__ import annotations

from abc import ABC, abstractmethod

from . import AST


class ReferenceResolver(ABC):
    @abstractmethod
    def resolve_reference(self, reference: AST.Reference, writer: AST.NodeWriter) -> str:
        ...
