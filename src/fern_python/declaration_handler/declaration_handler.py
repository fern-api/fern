from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from fern_python.logger import Logger

from .declaration_handler_context import DeclarationHandlerContext

T = TypeVar("T")


class DeclarationHandler(ABC, Generic[T]):
    def __init__(self, declaration: T, context: DeclarationHandlerContext, logger: Logger):
        self._declaration = declaration
        self._context = context
        self._logger = logger

    @abstractmethod
    def run(self) -> None:
        ...
