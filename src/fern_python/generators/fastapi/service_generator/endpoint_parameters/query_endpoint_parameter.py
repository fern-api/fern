import fern.ir.pydantic as ir_types

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI

from ...context import FastApiGeneratorContext
from .convert_to_singular_type import convert_to_singular_type
from .endpoint_parameter import EndpointParameter


class QueryEndpointParameter(EndpointParameter):
    def __init__(self, context: FastApiGeneratorContext, query_parameter: ir_types.QueryParameter):
        super().__init__(context=context)
        self._query_parameter = query_parameter

    def _get_unsafe_name(self) -> str:
        return QueryEndpointParameter.get_variable_name_of_query_parameter(self._query_parameter)

    def get_type(self) -> AST.TypeHint:
        if self._query_parameter.allow_multiple:
            return self.get_list_wrapped_type_hint()
        return convert_to_singular_type(self._context, self._query_parameter.value_type)

    def get_default(self) -> AST.Expression:
        value_type = self._query_parameter.value_type.get_as_union()
        return FastAPI.Query(
            is_optional=value_type.type == "container" and value_type.container.get_as_union().type == "optional",
            variable_name=self.get_name(),
            wire_value=self._query_parameter.name.wire_value,
        )

    def get_list_wrapped_type_hint(self) -> AST.TypeHint:
        query_param_type = self._query_parameter.value_type.get_as_union()
        if query_param_type.type == "container":
            contaner_type = query_param_type.container.get_as_union()
            if contaner_type.type == "optional":
                return AST.TypeHint.optional(
                    AST.TypeHint.list(convert_to_singular_type(self._context, contaner_type.optional))
                )
        return convert_to_singular_type(self._context, self._query_parameter.value_type)

    @staticmethod
    def get_variable_name_of_query_parameter(query_parameter: ir_types.QueryParameter) -> str:
        return query_parameter.name.name.snake_case.unsafe_name
