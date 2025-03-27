import fern.ir.resources as ir_types
from ....context import FastApiGeneratorContext
from .request_endpoint_parameter import RequestEndpointParameter

from fern_python.codegen import AST


class ReferencedRequestEndpointParameter(RequestEndpointParameter):
    def __init__(self, context: FastApiGeneratorContext, request_type: ir_types.TypeReference):
        super().__init__(context=context)
        self._request_type = request_type

    def get_type(self) -> AST.TypeHint:
        return self._context.pydantic_generator_context.get_type_hint_for_type_reference(self._request_type)
