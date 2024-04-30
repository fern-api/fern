from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters
from .flattened_request_body_parameter_utils import (
    are_any_properties_optional_in_inlined_request,
    get_json_body_for_inlined_request,
    get_pre_fetch_statements_for_inlined_request,
)


class ReferencedRequestBodyParameters(AbstractRequestBodyParameters):
    def __init__(
        self,
        endpoint: ir_types.HttpEndpoint,
        request_body: ir_types.HttpRequestBodyReference,
        context: SdkGeneratorContext,
    ):
        self._endpoint = endpoint
        self._request_body = request_body
        self._context = context
        self._type_id = self._get_type_id_from_type_reference(self._request_body.request_body_type)

        self.should_inline_request_parameters = context.custom_config.inline_request_params and self._type_id is not None
        self._are_any_properties_optional = self.should_inline_request_parameters

    def _get_type_id_from_type_reference(self, type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeId]:
        return type_reference.visit(
            container=lambda _: None,
            named=lambda t: self._get_type_id_from_type(t.type_id),
            primitive=lambda _: None,
            unknown=lambda: None,
        )
    
    def _get_type_id_from_type(self, type_id: ir_types.TypeId) -> Optional[ir_types.TypeId]:
        declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(type_id)
        return declaration.shape.visit(
            alias=lambda atd: self._get_type_id_from_type_reference(atd.alias_of),
            enum=lambda _: None,
            object=lambda o: type_id,
            undiscriminated_union=lambda _: None,
            union=lambda _: None,
        )

    def get_parameters(self) -> List[AST.NamedFunctionParameter]:
        if self.should_inline_request_parameters and self._type_id is not None:
            return self._get_inlined_request_parameters()
        else:
            return self._get_default_referenced_parameters()

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    # Shared with inlined_request_body_parameters.py
    def _get_inlined_request_parameters(self) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body():
            if not self._is_type_literal(property.value_type):
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )
                parameters.append(
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
        return parameters

    def _get_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.unsafe_name

    def _get_all_properties_for_inlined_request_body(self) -> List[ir_types.InlinedRequestBodyProperty]:
        object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(self._type_id)
        inlined_properties = []
        for prop in object_properties:
            inlined_properties.append(ir_types.InlinedRequestBodyProperty(
                name=prop.name,
                value_type=prop.value_type,
                docs=prop.docs,
            ))
        return inlined_properties

    def _get_default_referenced_parameters(self) -> List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=self._get_request_parameter_name(),
                type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    self._request_body.request_body_type,
                    in_endpoint=True,
                ),
                raw_type=self._request_body.request_body_type,
            )
        ]

    def get_json_body(self) -> Optional[AST.Expression]:
        return (
            AST.Expression(self._get_request_parameter_name())
            if not self.should_inline_request_parameters
            else get_json_body_for_inlined_request(
                self._context, self._get_all_properties_for_inlined_request_body(), self._are_any_properties_optional
            )
        )

    def _get_request_parameter_name(self) -> str:
        if self._endpoint.sdk_request is None:
            raise RuntimeError("Request body is referenced by SDKRequestBody is not defined")
        return self._endpoint.sdk_request.request_parameter_name.snake_case.unsafe_name

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def get_pre_fetch_statements(self) -> Optional[AST.CodeWriter]:
        return (
            None
            if not self.should_inline_request_parameters
            else get_pre_fetch_statements_for_inlined_request(
                self._context, self._get_all_properties_for_inlined_request_body(), self._are_any_properties_optional
            )
        )

    def is_default_body_parameter_used(self) -> bool:
        return self._are_any_properties_optional

    def get_content(self) -> Optional[AST.Expression]:
        return None
