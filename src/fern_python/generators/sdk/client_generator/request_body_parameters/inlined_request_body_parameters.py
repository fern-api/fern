from typing import List, Optional

import fern.ir.pydantic as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from .abstract_request_body_parameters import AbstractRequestBodyParameters


class InlinedRequestBodyParameters(AbstractRequestBodyParameters):
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
            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_property_name(property),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        property.value_type
                    ),
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
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._get_all_properties_for_inlined_request_body():
                    writer.write_line(f'"{property.name.wire_value}": {self._get_property_name(property)},')
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write))

    def get_files(self) -> Optional[AST.Expression]:
        return None
