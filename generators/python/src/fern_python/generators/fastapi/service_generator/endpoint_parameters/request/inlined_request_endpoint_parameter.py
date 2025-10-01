import fern.ir.resources as ir_types
from ....context import FastApiGeneratorContext
from .request_endpoint_parameter import RequestEndpointParameter

from fern_python.codegen import AST


class InlinedRequestEndpointParameter(RequestEndpointParameter):
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        service_name: ir_types.DeclaredServiceName,
        request: ir_types.InlinedRequestBody,
    ):
        super().__init__(context=context)
        self._service_name = service_name
        self._request = request

    def get_type(self) -> AST.TypeHint:
        return AST.TypeHint(
            self._context.get_reference_to_inlined_request(service_name=self._service_name, request=self._request)
        )
