import fern.ir.resources as ir_types
from ...context import FastApiGeneratorContext
from .convert_to_singular_type import convert_to_singular_type
from .endpoint_parameter import EndpointParameter

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI


class PathEndpointParameter(EndpointParameter):
    def __init__(self, context: FastApiGeneratorContext, path_parameter: ir_types.PathParameter):
        super().__init__(context=context)
        self._path_parameter = path_parameter

    def _get_unsafe_name(self) -> str:
        return PathEndpointParameter.get_variable_name_of_path_parameter(self._path_parameter)

    def get_type(self) -> AST.TypeHint:
        return convert_to_singular_type(self._context, self._path_parameter.value_type)

    def get_default(self) -> AST.Expression:
        return FastAPI.Path

    @staticmethod
    def get_variable_name_of_path_parameter(path_parameter: ir_types.PathParameter) -> str:
        return path_parameter.name.snake_case.safe_name
