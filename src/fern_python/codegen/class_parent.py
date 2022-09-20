from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from . import AST

if TYPE_CHECKING:
    from .local_class_reference import LocalClassReference


class ClassParent(ABC):
    @abstractmethod
    def add_class_declaration(
        self,
        declaration: AST.ClassDeclaration,
        do_not_export: bool = False,
    ) -> LocalClassReference:
        ...
