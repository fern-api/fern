import fern.ir.resources as ir_types
from ...context import FastApiGeneratorContext
from .convert_to_singular_type import convert_to_singular_type
from .endpoint_parameter import EndpointParameter

from fern_python.codegen import AST
from fern_python.external_dependencies import FastAPI


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
        is_optional = value_type.type == "container" and (
            value_type.container.get_as_union().type == "optional"
            or value_type.container.get_as_union().type == "nullable"
        )
        default = None
        if is_optional:
            default = AST.Expression(AST.TypeHint.none())
        elif self._query_parameter.allow_multiple and not is_optional:
            default = AST.Expression("[]")
        return FastAPI.Query(
            default=default,
            variable_name=self.get_name(),
            wire_value=self._query_parameter.name.wire_value,
            docs=self._query_parameter.docs,
        )

    def get_list_wrapped_type_hint(self) -> AST.TypeHint:
        query_param_type = self._query_parameter.value_type.get_as_union()
        if query_param_type.type == "container":
            container_type = query_param_type.container.get_as_union()
            if container_type.type == "optional":
                return AST.TypeHint.optional(
                    AST.TypeHint.list(
                        convert_to_singular_type(self._context, self._unbox_type_reference(container_type.optional))
                    )
                )
            if container_type.type == "nullable":
                return AST.TypeHint.optional(
                    AST.TypeHint.list(
                        convert_to_singular_type(self._context, self._unbox_type_reference(container_type.nullable))
                    )
                )
        return AST.TypeHint.list(convert_to_singular_type(self._context, self._query_parameter.value_type))

    def _unbox_type_reference(self, type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
        return type_reference.visit(
            container=lambda container: self._unbox_type_reference_container(
                type_reference=type_reference,
                container=container,
            ),
            named=lambda _: type_reference,
            primitive=lambda _: type_reference,
            unknown=lambda: type_reference,
        )

    def _unbox_type_reference_container(
        self, type_reference: ir_types.TypeReference, container: ir_types.ContainerType
    ) -> ir_types.TypeReference:
        return container.visit(
            list_=lambda _: type_reference,
            map_=lambda _: type_reference,
            set_=lambda _: type_reference,
            nullable=lambda nullable: self._unbox_type_reference(type_reference=nullable),
            optional=lambda optional: self._unbox_type_reference(type_reference=optional),
            literal=lambda _: type_reference,
        )

    @staticmethod
    def get_variable_name_of_query_parameter(query_parameter: ir_types.QueryParameter) -> str:
        return query_parameter.name.name.snake_case.safe_name
