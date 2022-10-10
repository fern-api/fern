import fern.ir.pydantic as ir_types

from fern_python.codegen import AST

from ...context import FastApiGeneratorContext
from ...external_dependencies import FastAPI
from .endpoint_parameter import EndpointParameter


class PathEndpointParameter(EndpointParameter):
    def __init__(self, context: FastApiGeneratorContext, path_parameter: ir_types.services.PathParameter):
        super().__init__(context=context)
        self._path_parameter = path_parameter

    def get_name(self) -> str:
        return PathEndpointParameter.get_variable_name_of_path_parameter(self._path_parameter)

    def get_type(self) -> AST.TypeHint:
        return self._context.pydantic_generator_context.get_type_hint_for_type_reference(
            self._path_parameter.value_type
        )

    def get_default(self) -> AST.Expression:
        return FastAPI.Path

    @staticmethod
    def get_variable_name_of_path_parameter(path_parameter: ir_types.services.PathParameter) -> str:
        return path_parameter.name.snake_case
