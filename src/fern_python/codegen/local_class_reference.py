from __future__ import annotations

from abc import ABC, abstractmethod

from . import AST


class LocalClassReference(AST.ClassReference, ABC):
    @abstractmethod
    def add_class_declaration(self, declaration: AST.ClassDeclaration) -> LocalClassReference:
        ...
