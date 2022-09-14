from abc import ABC, abstractmethod

from fern_python.codegen import AST, SourceFile
from fern_python.generated import ir_types


class DeclarationHandlerContext(ABC):
    def __init__(self, source_file: SourceFile) -> None:
        self.source_file = source_file

    @abstractmethod
    def get_type_hint_for_type_reference(self, type_reference: ir_types.TypeReference) -> AST.TypeHint:
        ...

    @abstractmethod
    def get_class_reference_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> AST.ClassReference:
        ...
