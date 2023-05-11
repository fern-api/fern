from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters


class InlinedRequestBodyParameters(AbstractRequestBodyParameters):
    _REQUEST_VARIABLE_NAME = "_request"

    def __init__(
        self,
        endpoint: ir_types.HttpEndpoint,
        request_body: ir_types.InlinedRequestBody,
        context: SdkGeneratorContext,
    ):
        self._endpoint = endpoint
        self._request_body = request_body
        self._context = context

    def get_parameters(self) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body():
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(property.value_type)
            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_property_name(property),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        property.value_type
                    ),
                    initializer=AST.Expression(DEFAULT_BODY_PARAMETER_VALUE)
                    if AST.TypeHint.is_optional(type_hint)
                    else None,
                ),
            )
        return parameters

    def _get_all_properties_for_inlined_request_body(self) -> List[ir_types.InlinedRequestBodyProperty]:
        properties = self._request_body.properties.copy()
        for extension in self._request_body.extends:
            properties.extend(
                [
                    ir_types.InlinedRequestBodyProperty(
                        name=extended_property.name,
                        value_type=extended_property.value_type,
                        docs=extended_property.docs,
                    )
                    for extended_property in (
                        self._context.pydantic_generator_context.get_all_properties_including_extensions(extension)
                    )
                ]
            )
        return properties

    def _get_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.unsafe_name

    def get_reference_to_request_body(self) -> AST.Expression:
        if self._are_any_properties_optional():
            return AST.Expression(InlinedRequestBodyParameters._REQUEST_VARIABLE_NAME)

        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._get_all_properties_for_inlined_request_body():
                    writer.write_line(f'"{property.name.wire_value}": {self._get_property_name(property)},')
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write))

    def _are_any_properties_optional(self) -> bool:
        return any(
            AST.TypeHint.is_optional(
                self._context.pydantic_generator_context.get_type_hint_for_type_reference(body_property.value_type)
            )
            for body_property in self._get_all_properties_for_inlined_request_body()
        )

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def get_pre_fetch_statements(self) -> Optional[AST.CodeWriter]:
        if not self._are_any_properties_optional():
            return None

        optional_properties = []
        required_properties = []
        for body_property in self._get_all_properties_for_inlined_request_body():
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                body_property.value_type
            )
            if AST.TypeHint.is_optional(type_hint):
                optional_properties.append(body_property)
            else:
                required_properties.append(body_property)

        def write(writer: AST.NodeWriter) -> None:
            writer.write(f"{InlinedRequestBodyParameters._REQUEST_VARIABLE_NAME}: ")
            writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.any()))
            writer.write(" = ")
            if len(required_properties) == 0:
                writer.write_line("{}")
            else:
                writer.write_line("{")
                with writer.indent():
                    for required_property in required_properties:
                        writer.write_line(
                            f'"{required_property.name.wire_value}": {self._get_property_name(required_property)},'
                        )
                writer.write_line("}")

            for optional_property in optional_properties:
                writer.write_line(
                    f"if {self._get_property_name(optional_property)} is not {DEFAULT_BODY_PARAMETER_VALUE}:"
                )
                with writer.indent():
                    writer.write_line(
                        f'{InlinedRequestBodyParameters._REQUEST_VARIABLE_NAME}["{optional_property.name.wire_value}"] = {self._get_property_name(optional_property)}'
                    )

        return AST.CodeWriter(write)

    def is_default_body_parameter_used(self) -> bool:
        return self._are_any_properties_optional()
