from abc import ABC, abstractmethod

import fern.ir.resources as ir_types
from fern.generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath

from ...context import PydanticGeneratorContextImpl
from ..core_utilities import CoreUtilities
from ..declaration_referencers import TypeDeclarationReferencer


class FastApiGeneratorContext(ABC):
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
        project_module_path: AST.ModulePath,
        use_str_enums: bool,
    ):
        self.ir = ir
        self.generator_config = generator_config
        self.pydantic_generator_context = PydanticGeneratorContextImpl(
            ir=ir,
            type_declaration_referencer=TypeDeclarationReferencer(),
            generator_config=generator_config,
            project_module_path=project_module_path,
            allow_skipping_validation=False,
            allow_leveraging_defaults=False,
            use_typeddict_requests=False,
            use_str_enums=use_str_enums,
        )
        self.core_utilities = CoreUtilities()

    @abstractmethod
    def get_filepath_for_service(self, service_name: ir_types.DeclaredServiceName) -> Filepath:
        ...

    @abstractmethod
    def get_class_name_for_service(self, service_name: ir_types.DeclaredServiceName) -> str:
        ...

    @abstractmethod
    def get_reference_to_service(self, service_name: ir_types.DeclaredServiceName) -> AST.ClassReference:
        ...

    @abstractmethod
    def get_filepath_for_inlined_request(
        self, service_name: ir_types.DeclaredServiceName, request: ir_types.InlinedRequestBody
    ) -> Filepath:
        ...

    @abstractmethod
    def get_class_name_for_inlined_request(
        self, service_name: ir_types.DeclaredServiceName, request: ir_types.InlinedRequestBody
    ) -> str:
        ...

    @abstractmethod
    def get_reference_to_inlined_request(
        self, service_name: ir_types.DeclaredServiceName, request: ir_types.InlinedRequestBody
    ) -> AST.ClassReference:
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
