from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Callable, List, Optional, Set

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath
from fern_python.declaration_referencer import AbstractDeclarationReferencer

from ..core_utilities import CoreUtilities


class PydanticGeneratorContext(ABC):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        type_declaration_referencer: AbstractDeclarationReferencer[ir_types.DeclaredTypeName],
        generator_config: GeneratorConfig,
        allow_skipping_validation: bool,
        use_typeddict_requests: bool,
        use_str_enums: bool,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.core_utilities = CoreUtilities(
            allow_skipping_validation=allow_skipping_validation,
            use_typeddict_requests=use_typeddict_requests,
        )
        self.use_typeddict_requests = use_typeddict_requests
        self.type_declaration_referencer = type_declaration_referencer
        self.use_str_enums = use_str_enums

    @abstractmethod
    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath:
        ...

    @abstractmethod
    def get_type_hint_for_type_reference(
        self,
        type_reference: ir_types.TypeReference,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
        as_if_type_checking_import: bool = False,
        in_endpoint: Optional[bool] = False,
        for_typeddict: bool = False,
    ) -> AST.TypeHint:
        ...

    @abstractmethod
    def get_class_reference_for_type_id(
        self,
        type_id: ir_types.TypeId,
        as_request: bool,
        must_import_after_current_declaration: Optional[Callable[[ir_types.DeclaredTypeName], bool]] = None,
        as_if_type_checking_import: bool = False,
    ) -> AST.ClassReference:
        ...

    @abstractmethod
    def does_circularly_reference_itself(self, type_id: ir_types.TypeId) -> bool:
        ...

    @abstractmethod
    def do_types_reference_each_other(self, a: ir_types.TypeId, b: ir_types.TypeId) -> bool:
        ...

    @abstractmethod
    def does_type_reference_other_type(self, type_id: ir_types.TypeId, other_type_id: ir_types.TypeId) -> bool:
        ...

    @abstractmethod
    def get_referenced_types(self, type_id: ir_types.TypeId) -> Set[ir_types.TypeId]:
        ...

    @abstractmethod
    def get_class_name_for_type_id(self, type_id: ir_types.TypeId, as_request: bool) -> str:
        ...

    @abstractmethod
    def get_declaration_for_type_id(self, type_id: ir_types.TypeId) -> ir_types.TypeDeclaration:
        ...

    @abstractmethod
    def get_referenced_types_of_type_declaration(
        self, type_declaration: ir_types.TypeDeclaration
    ) -> Set[ir_types.TypeId]:
        ...

    @abstractmethod
    def get_referenced_types_of_type_reference(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        ...

    @abstractmethod
    def get_type_names_in_type_reference(self, type_reference: ir_types.TypeReference) -> Set[ir_types.TypeId]:
        ...

    @abstractmethod
    def get_initializer_for_type_reference(self, type_reference: ir_types.TypeReference) -> Optional[AST.Expression]:
        ...

    @abstractmethod
    def get_filepath_for_type_id(self, type_id: ir_types.TypeId, as_request: bool) -> Filepath:
        ...

    @abstractmethod
    def get_all_properties_including_extensions(self, type_id: ir_types.TypeId) -> List[ir_types.ObjectProperty]:
        ...

    @abstractmethod
    def maybe_get_type_ids_for_type_reference(
        self, type_reference: ir_types.TypeReference
    ) -> Optional[List[ir_types.TypeId]]:
        ...
