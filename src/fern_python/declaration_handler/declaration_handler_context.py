from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Callable, Optional, Set, Tuple

from fern_python.codegen import AST, SourceFile
from fern_python.generated import ir_types


class DeclarationHandlerContext(ABC):
    def __init__(self, source_file: SourceFile) -> None:
        self.source_file = source_file

    @abstractmethod
    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.TypeHint:
        ...

    @abstractmethod
    def get_class_reference_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_referenced_types(self, type_name: ir_types.DeclaredTypeName) -> Set[HashableDeclaredTypeName]:
        ...

    @abstractmethod
    def get_class_name_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> str:
        ...


@dataclass(frozen=True)
class HashableDeclaredTypeName:
    fern_filepath: Tuple[str, ...]
    name: str

    @staticmethod
    def of(type_name: ir_types.DeclaredTypeName) -> HashableDeclaredTypeName:
        return HashableDeclaredTypeName(
            fern_filepath=tuple(part.original_value for part in type_name.fern_filepath),
            name=type_name.name,
        )
