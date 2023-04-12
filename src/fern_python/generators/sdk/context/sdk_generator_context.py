from abc import ABC, abstractmethod

import fern.ir.pydantic as ir_types
from fern.generator_exec.sdk.resources import GeneratorConfig

from fern_python.codegen import AST
from fern_python.codegen.filepath import Filepath
from fern_python.generators.pydantic_model import PydanticGeneratorContextImpl

from ..core_utilities.core_utilities import CoreUtilities
from ..declaration_referencers.type_declaration_referencer import (
    TypeDeclarationReferencer,
)
from ..sdk_filepath_creator import SdkFilepathCreator


class SdkGeneratorContext(ABC):
    def __init__(
        self,
        *,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.filepath_creator = SdkFilepathCreator(ir=ir, generator_config=generator_config)
        self.pydantic_generator_context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(filepath_creator=self.filepath_creator),
            generator_config=generator_config,
            filepath_creator=self.filepath_creator,
        )
        self.core_utilities = CoreUtilities(filepath_creator=self.filepath_creator)

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
