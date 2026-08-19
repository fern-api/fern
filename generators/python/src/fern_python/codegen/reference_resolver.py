from __future__ import annotations

import dataclasses
from abc import ABC, abstractmethod
from typing import Optional

from . import AST


@dataclasses.dataclass
class ResolvedImport:
    import_: Optional[AST.ReferenceImport]
    prefix_for_qualified_names: AST.QualifiedName


class ReferenceResolver(ABC):
    @abstractmethod
    def resolve_reference(self, reference: AST.Reference) -> str: ...

    @abstractmethod
    def resolve_import(self, import_: AST.ReferenceImport) -> ResolvedImport: ...
