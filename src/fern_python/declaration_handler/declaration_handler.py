from abc import ABC, abstractmethod
from typing import Generic, TypeVar

T = TypeVar("T")


class DeclarationHandler(ABC, Generic[T]):
    @abstractmethod
    def run(self, declaration: T) -> None:
        ...
