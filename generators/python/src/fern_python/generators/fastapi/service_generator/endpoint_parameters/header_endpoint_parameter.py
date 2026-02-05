import typing

from ...context import FastApiGeneratorContext
from .convert_to_singular_type import convert_to_singular_type
from .endpoint_parameter import EndpointParameter
from fern_python.codegen import AST

import fern.ir.resources as ir_types


class HeaderEndpointParameter(EndpointParameter):
    def __init__(self, context: FastApiGeneratorContext, header: ir_types.HttpHeader):
        super().__init__(context=context)
        self._header = header

    def _get_unsafe_name(self) -> str:
        return HeaderEndpointParameter.get_variable_name_of_header(self._header)

    def get_type(self) -> AST.TypeHint:
        return convert_to_singular_type(self._context, self._header.value_type)

    def get_fastapi_marker(self) -> AST.Expression:
        return self._context.fastapi_params.Header(wire_value=self._header.name.wire_value)

    def get_python_default(self) -> "typing.Optional[AST.Expression]":
        value_type = self._header.value_type.get_as_union()
        is_optional = value_type.type == "container" and (
            value_type.container.get_as_union().type == "optional"
            or value_type.container.get_as_union().type == "nullable"
        )
        if is_optional:
            return AST.Expression(AST.TypeHint.none())
        return None

    @staticmethod
    def get_variable_name_of_header(header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.safe_name
