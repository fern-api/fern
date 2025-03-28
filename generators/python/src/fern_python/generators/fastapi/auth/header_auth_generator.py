import fern.ir.resources as ir_types
from ..context import FastApiGeneratorContext
from .abstract_auth_generator import AbstractAuthGenerator

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI


class HeaderAuthGenerator(AbstractAuthGenerator):
    def __init__(self, context: FastApiGeneratorContext, http_header: ir_types.HeaderAuthScheme):
        super().__init__(context=context)
        self._http_header = http_header
        self._context = context

    def get_dependency(self) -> AST.Expression:
        return FastAPI.Header(is_optional=False, wire_value=self._http_header.name.wire_value)

    def get_parsed_auth_type(self) -> AST.TypeHint:
        return self._context.pydantic_generator_context.get_type_hint_for_type_reference(
            type_reference=self._http_header.value_type
        )
