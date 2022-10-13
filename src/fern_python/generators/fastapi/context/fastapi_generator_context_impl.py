import fern.ir.pydantic as ir_types
from generator_exec.resources import GeneratorConfig

from fern_python.codegen import AST, Filepath

from ..declaration_referencers import (
    ErrorDeclarationReferencer,
    ServiceDeclarationReferencer,
)
from .fastapi_generator_context import FastApiGeneratorContext


class FastApiGeneratorContextImpl(FastApiGeneratorContext):
    def __init__(
        self,
        ir: ir_types.IntermediateRepresentation,
        generator_config: GeneratorConfig,
    ):
        super().__init__(ir=ir, generator_config=generator_config)
        self._service_declaration_handler = ServiceDeclarationReferencer(filepath_creator=self.filepath_creator)
        self._error_declaration_handler = ErrorDeclarationReferencer(filepath_creator=self.filepath_creator)

    def get_filepath_for_service(self, service_name: ir_types.services.DeclaredServiceName) -> Filepath:
        return self._service_declaration_handler.get_filepath(name=service_name)

    def get_class_name_for_service(self, service_name: ir_types.services.DeclaredServiceName) -> str:
        return self._service_declaration_handler.get_class_name(name=service_name)

    def get_reference_to_service(self, service_name: ir_types.services.DeclaredServiceName) -> AST.ClassReference:
        return self._service_declaration_handler.get_class_reference(name=service_name)

    def get_filepath_for_error(self, error_name: ir_types.DeclaredErrorName) -> Filepath:
        return self._error_declaration_handler.get_filepath(name=error_name)

    def get_class_name_for_error(self, error_name: ir_types.DeclaredErrorName) -> str:
        return self._error_declaration_handler.get_class_name(name=error_name)

    def get_reference_to_error(self, error_name: ir_types.DeclaredErrorName) -> AST.ClassReference:
        return self._error_declaration_handler.get_class_reference(name=error_name)
