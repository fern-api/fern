from abc import ABC, abstractmethod

from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types


class AbstractTypeGenerator(ABC):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        context: DeclarationHandlerContext,
    ):
        self._name = name
        self._context = context

    @abstractmethod
    def generate(self) -> None:
        ...
