from abc import ABC, abstractmethod

import fern.ir.pydantic as ir_types

from fern_python.codegen import SourceFile

from ..context import PydanticGeneratorContext
from ..custom_config import CustomConfig


class AbstractTypeGenerator(ABC):
    def __init__(
        self,
        name: ir_types.DeclaredTypeName,
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: CustomConfig,
    ):
        self._name = name
        self._context = context
        self._custom_config = custom_config
        self._source_file = source_file

    @abstractmethod
    def generate(self) -> None:
        ...
