from typing import Set

from ...ast_node import GenericTypeVar, ReferenceResolver
from ...references import Reference


class ReferenceLoadingReferenceResolver(ReferenceResolver):
    """
    A dummy reference resolver that keeps track of all references that were
    encountered.
    """

    def __init__(self) -> None:
        self.references: Set[Reference] = set()
        self.generics: Set[GenericTypeVar] = set()

    def resolve_reference(self, reference: Reference) -> str:
        self.references.add(reference)
        return "<UNRESOLVED REFERENCE>"
