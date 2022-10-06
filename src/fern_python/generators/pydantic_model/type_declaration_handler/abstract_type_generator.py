from abc import ABC, abstractmethod

from fern_python.declaration_handler import DeclarationHandlerContext
from fern_python.generated import ir_types

from ..custom_config import CustomConfig


class AbstractTypeGenerator(ABC):
    def __init__(
        self, name: ir_types.DeclaredTypeName, context: DeclarationHandlerContext, custom_config: CustomConfig
    ):
        self._name = name
        self._context = context
        self._custom_config = custom_config

    @abstractmethod
    def generate(self) -> None:
        ...
