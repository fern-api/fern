from abc import ABC, abstractmethod

from ..references import Reference


class ReferenceResolver(ABC):
    @abstractmethod
    def resolve_reference(self, reference: Reference) -> str:
        ...
