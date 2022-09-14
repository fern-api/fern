from abc import ABC, abstractmethod

from fern_python.codegen import AST, SourceFile
from fern_python.generated.ir_types import TypeReference


class DeclarationHandlerContext(ABC):
    def __init__(self, source_file: SourceFile) -> None:
        self.source_file = source_file

    @abstractmethod
    def get_type_hint_for_type_reference(self, type_reference: TypeReference) -> AST.TypeHint:
        ...
