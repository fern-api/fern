import fern.ir.pydantic as ir_types

from fern_python.codegen import AST

from ..context import FastApiGeneratorContext


class ServiceInitializer:
    def __init__(self, service: ir_types.HttpService, context: FastApiGeneratorContext, is_in_development: bool):
        self._service = service
        self._context = context
        self.is_in_development = is_in_development

    def get_register_parameter(self) -> AST.FunctionParameter:
        type_hint = AST.TypeHint(type=self._context.get_reference_to_service(service_name=self._service.name))
        if self.is_in_development:
            type_hint = AST.TypeHint.optional(type_hint)
        return AST.FunctionParameter(
            name=self.get_parameter_name(),
            type_hint=type_hint,
        )

    def get_parameter_name(self) -> str:
        return "_".join(part.snake_case.unsafe_name for part in self._service.name.fern_filepath.get_as_list())
