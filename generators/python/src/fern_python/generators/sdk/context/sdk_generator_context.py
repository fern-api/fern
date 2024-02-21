import typing
from abc import ABC, abstractmethod
from typing import Optional

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath

from ...context import PydanticGeneratorContextImpl
from ..core_utilities.core_utilities import CoreUtilities
from ..custom_config import SDKCustomConfig
from ..declaration_referencers.type_declaration_referencer import (
    TypeDeclarationReferencer,
)


class SdkGeneratorContext(ABC):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        custom_config: SDKCustomConfig,
        project_module_path: AST.ModulePath,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.pydantic_generator_context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(),
            generator_config=generator_config,
            project_module_path=project_module_path,
        )
        self.core_utilities = CoreUtilities()
        self.custom_config = custom_config

    @abstractmethod
    def get_module_path_in_project(self, module_path: AST.ModulePath) -> AST.ModulePath:
        ...

    @abstractmethod
    def get_filepath_for_error(self, error_name: ir_types.DeclaredErrorName) -> Filepath:
        ...

    @abstractmethod
    def get_class_name_for_error(self, error_name: ir_types.DeclaredErrorName) -> str:
        ...

    @abstractmethod
    def get_reference_to_error(self, error_name: ir_types.DeclaredErrorName) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_class_name_of_environments(self) -> str:
        ...

    @abstractmethod
    def get_filepath_for_environments_enum(self) -> Filepath:
        ...

    @abstractmethod
    def get_reference_to_environments_class(self) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_filepath_for_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        ...

    @abstractmethod
    def get_reference_to_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_class_name_of_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        ...

    @abstractmethod
    def get_filepath_for_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> Filepath:
        ...

    @abstractmethod
    def get_reference_to_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_class_name_of_async_subpackage_service(self, subpackage_id: ir_types.SubpackageId) -> str:
        ...

    @abstractmethod
    def get_filepath_for_root_client(self) -> Filepath:
        ...

    @abstractmethod
    def get_class_name_for_root_client(self) -> str:
        ...

    @abstractmethod
    def get_literal_header_value(self, header: ir_types.HttpHeader) -> Optional[typing.Union[str, bool]]:
        ...

    @abstractmethod
    def get_literal_value(self, reference: ir_types.TypeReference) -> Optional[typing.Union[str, bool]]:
        ...

    @abstractmethod
    def resolved_schema_is_enum(self, reference: ir_types.TypeReference) -> bool:
        ...

    @abstractmethod
    def resolved_schema_is_optional_enum(self, reference: ir_types.TypeReference) -> bool:
        ...
