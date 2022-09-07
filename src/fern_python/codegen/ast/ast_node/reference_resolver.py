from abc import ABC, abstractmethod

from ..reference import Reference


class ReferenceResolver(ABC):
    @abstractmethod
    def resolve_reference(self, reference: Reference) -> str:
        ...
