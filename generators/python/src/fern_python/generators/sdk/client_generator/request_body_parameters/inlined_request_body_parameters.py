from typing import Dict, List, Optional

import fern.ir.resources as ir_types
from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters
from .flattened_request_body_parameter_utils import (
    are_any_properties_optional_in_inlined_request,
    get_json_body_for_inlined_request,
)

from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.declarations.function.named_function_parameter import (
    NamedFunctionParameter,
)


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
        self._are_any_properties_optional = are_any_properties_optional_in_inlined_request(
            context, self._get_all_properties_for_inlined_request_body()
        )

    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body():
            if not self._is_type_literal(property.value_type):
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )
                maybe_default_value = self._context.pydantic_generator_context.get_initializer_for_type_reference(
                    property.value_type,
                )
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=self._get_property_name(property),
                        docs=property.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            property.value_type,
                            in_endpoint=True,
                        ),
                        initializer=maybe_default_value
                        if maybe_default_value is not None
                        else AST.Expression(DEFAULT_BODY_PARAMETER_VALUE)
                        if type_hint.is_optional
                        else None,
                        raw_type=property.value_type,
                        raw_name=property.name.wire_value,
                    ),
                )
        return parameters

    def _get_non_parameter_properties(self) -> List[AST.NamedFunctionParameter]:
        non_param_properties = []

        parameters: List[AST.NamedFunctionParameter] = self.get_parameters()
        parameter_names = [parameter.name for parameter in parameters]
        for property in self._get_all_properties_for_inlined_request_body():
            if self._get_property_name(property) not in parameter_names:
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )
                non_param_properties.append(
                    AST.NamedFunctionParameter(
                        name=self._get_property_name(property),
                        docs=property.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            property.value_type,
                            in_endpoint=True,
                        ),
                        initializer=AST.Expression(DEFAULT_BODY_PARAMETER_VALUE) if type_hint.is_optional else None,
                        raw_type=property.value_type,
                        raw_name=property.name.wire_value,
                    ),
                )
        return non_param_properties

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

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
                        self._context.pydantic_generator_context.get_all_properties_including_extensions(
                            extension.type_id
                        )
                    )
                ]
            )
        return properties

    def _get_properties(self) -> List[NamedFunctionParameter]:
        return self.get_parameters() + self._get_non_parameter_properties()

    def _get_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.safe_name

    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]:
        return get_json_body_for_inlined_request(
            self._context,
            self._get_properties(),
        )

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return self._are_any_properties_optional

    def get_content(self) -> Optional[AST.Expression]:
        return None

    def get_parameter_name_rewrites(self) -> Dict[ir_types.Name, str]:
        return {}
