import fern.ir.pydantic as ir_types

from fern_python.codegen import AST

from ..context import FastApiGeneratorContext


class ServiceInitializer:
    def __init__(self, service: ir_types.services.HttpService, context: FastApiGeneratorContext):
        self._service = service
        self._context = context

    def get_register_parameter(self) -> AST.FunctionParameter:
        return AST.FunctionParameter(
            name=self.get_parameter_name(),
            type_hint=AST.TypeHint(type=self._context.get_reference_to_service(service_name=self._service.name)),
        )

    def get_parameter_name(self) -> str:
        return "_".join(part.snake_case for part in self._service.name.fern_filepath.get_as_list())
