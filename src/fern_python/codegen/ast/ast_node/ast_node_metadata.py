from __future__ import annotations

import dataclasses
from typing import Set

from ..references import Reference
from .generic_type_var import GenericTypeVar


@dataclasses.dataclass
class AstNodeMetadata:
    references: Set[Reference] = dataclasses.field(default_factory=set)
    declarations: Set[str] = dataclasses.field(default_factory=set)
    generics: Set[GenericTypeVar] = dataclasses.field(default_factory=set)

    def update(self, other: AstNodeMetadata) -> None:
        self.references.update(other.references)
        self.declarations.update(other.declarations)
        self.generics.update(other.generics)
