from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Callable, List, Optional, Set, Tuple

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath

from ..core_utilities import CoreUtilities


class PydanticGeneratorContext(ABC):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.core_utilities = CoreUtilities()

    @abstractmethod
    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath:
        ...

    @abstractmethod
    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.TypeHint:
        ...

    @abstractmethod
    def get_class_reference_for_type_name(
        self,
        type_name: ir_types.DeclaredTypeName,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
    ) -> AST.ClassReference:
        ...

    @abstractmethod
    def does_circularly_reference_itself(self, type_name: ir_types.DeclaredTypeName) -> bool:
        ...

    @abstractmethod
    def do_types_reference_each_other(self, a: ir_types.DeclaredTypeName, b: ir_types.DeclaredTypeName) -> bool:
        ...

    @abstractmethod
    def does_type_reference_other_type(
        self, type: ir_types.DeclaredTypeName, other_type: ir_types.DeclaredTypeName
    ) -> bool:
        ...

    @abstractmethod
    def get_referenced_types(self, type_name: ir_types.DeclaredTypeName) -> Set[HashableDeclaredTypeName]:
        ...

    @abstractmethod
    def get_class_name_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> str:
        ...

    @abstractmethod
    def get_declaration_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> ir_types.TypeDeclaration:
        ...

    @abstractmethod
    def get_referenced_types_of_type_declaration(
        self, declared_type_name: ir_types.TypeDeclaration
    ) -> List[ir_types.DeclaredTypeName]:
        ...

    @abstractmethod
    def get_referenced_types_of_type_reference(
        self, type_reference: ir_types.TypeReference
    ) -> List[ir_types.DeclaredTypeName]:
        ...

    @abstractmethod
    def get_type_names_in_type_reference(
        self, type_reference: ir_types.TypeReference
    ) -> List[ir_types.DeclaredTypeName]:
        ...

    @abstractmethod
    def get_filepath_for_type_name(self, type_name: ir_types.DeclaredTypeName) -> Filepath:
        ...

    @abstractmethod
    def get_all_properties_including_extensions(
        self, type_name: ir_types.DeclaredTypeName
    ) -> List[ir_types.ObjectProperty]:
        ...


@dataclass(frozen=True)
class HashableDeclaredTypeName:
    fern_filepath: Tuple[str, ...]
    name: str

    @staticmethod
    def of(type_name: ir_types.DeclaredTypeName) -> HashableDeclaredTypeName:
        return HashableDeclaredTypeName(
            fern_filepath=tuple(part.original_name for part in type_name.fern_filepath.all_parts),
            name=type_name.name.original_name,
        )
