from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from .declaration_handler_context import DeclarationHandlerContext

T = TypeVar("T")


class DeclarationHandler(ABC, Generic[T]):
    def __init__(self, declaration: T, context: DeclarationHandlerContext):
        self._declaration = declaration
        self._context = context

    @abstractmethod
    def run(self) -> None:
        ...
