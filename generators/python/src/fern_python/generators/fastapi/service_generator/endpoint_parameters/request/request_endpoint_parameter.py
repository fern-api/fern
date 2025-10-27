from ....context import FastApiGeneratorContext
from ..endpoint_parameter import EndpointParameter
from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI


class RequestEndpointParameter(EndpointParameter):
    def __init__(self, context: FastApiGeneratorContext):
        super().__init__(context=context)

    def get_name(self) -> str:
        return self._get_request_param_name()

    def _get_unsafe_name(self) -> str:
        return self._get_request_param_name()

    def get_default(self) -> AST.Expression:
        return FastAPI.Body(default=None, variable_name=None, wire_value=None, docs=None)
