from __future__ import annotations

import dataclasses

from ordered_set import OrderedSet

from ..references import Reference
from .generic_type_var import GenericTypeVar


@dataclasses.dataclass
class AstNodeMetadata:
    references: OrderedSet[Reference] = dataclasses.field(default_factory=OrderedSet)
    declarations: OrderedSet[str] = dataclasses.field(default_factory=OrderedSet)
    generics: OrderedSet[GenericTypeVar] = dataclasses.field(default_factory=OrderedSet)

    def update(self, other: AstNodeMetadata) -> None:
        self.references.update(other.references)
        self.declarations.update(other.declarations)
        self.generics.update(other.generics)
