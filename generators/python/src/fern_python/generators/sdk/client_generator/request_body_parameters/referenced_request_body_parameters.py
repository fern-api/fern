from typing import Dict, List, Optional

import fern.ir.resources as ir_types
from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters
from .flattened_request_body_parameter_utils import get_json_body_for_inlined_request

from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.declarations.function.named_function_parameter import (
    NamedFunctionParameter,
)
from fern_python.generators.pydantic_model.model_utilities import can_tr_be_fern_model


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

        self.should_inline_request_parameters = (
            context.custom_config.inline_request_params and self._type_id is not None
        )
        self._are_any_properties_optional = self.should_inline_request_parameters
        self.parameter_name_rewrites: Dict[ir_types.Name, str] = {}

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

    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]:
        if self.should_inline_request_parameters:
            return self._get_inlined_request_parameters(names_to_deconflict)
        else:
            return self._get_default_referenced_parameters()

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    # Shared with inlined_request_body_parameters.py
    def _get_inlined_request_parameters(
        self, names_to_deconflict: Optional[List[str]]
    ) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body():
            if not self._is_type_literal(property.value_type):
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    property.value_type,
                    in_endpoint=True,
                )

                property_name = self._get_property_name(property)
                if names_to_deconflict is not None and property_name in names_to_deconflict:
                    maybe_body_name = self.get_body_name()
                    property_name = f"{(maybe_body_name.snake_case.safe_name if maybe_body_name is not None else 'request')}_{property_name}"

                self.parameter_name_rewrites[property.name.name] = property_name
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=property_name,
                        docs=property.docs,
                        type_hint=type_hint,
                        initializer=AST.Expression(DEFAULT_BODY_PARAMETER_VALUE) if type_hint.is_optional else None,
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

                maybe_default_value = self._context.pydantic_generator_context.get_initializer_for_type_reference(
                    property.value_type
                )
                non_param_properties.append(
                    AST.NamedFunctionParameter(
                        name=self._get_property_name(property),
                        docs=property.docs,
                        type_hint=type_hint,
                        initializer=maybe_default_value
                        if maybe_default_value is not None
                        else AST.Expression(DEFAULT_BODY_PARAMETER_VALUE)
                        if type_hint.is_optional
                        else None,
                        raw_type=property.value_type,
                        raw_name=property.name.wire_value,
                    ),
                )
        return non_param_properties

    def _get_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.safe_name

    def _get_all_properties_for_inlined_request_body(self) -> List[ir_types.InlinedRequestBodyProperty]:
        if self._type_id is None:
            raise RuntimeError("Request body type is not defined, this should never happen.")
        object_properties = self._context.pydantic_generator_context.get_all_properties_including_extensions(
            self._type_id
        )

        inlined_properties = []
        for prop in object_properties:
            inlined_properties.append(
                ir_types.InlinedRequestBodyProperty(
                    name=prop.name,
                    value_type=prop.value_type,
                    docs=prop.docs,
                )
            )
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

    def _get_properties(self, names_to_deconflict: Optional[List[str]]) -> List[NamedFunctionParameter]:
        return self.get_parameters(names_to_deconflict) + self._get_non_parameter_properties()

    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]:
        if not self.should_inline_request_parameters:
            request_param = AST.Expression(self._get_request_parameter_name())
            request_param_tr = self._request_body.request_body_type

            if (
                self._context.custom_config.pydantic_config.use_typeddict_requests
                or not self._context.custom_config.pydantic_config.use_pydantic_field_aliases
            ) and can_tr_be_fern_model(request_param_tr, self._context.get_types()):
                # We don't need any optional wrappings for the coercion here.
                unwrapped_tr = self._context.unwrap_optional_type_reference(request_param_tr)
                type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    unwrapped_tr,
                    in_endpoint=True,
                    for_typeddict=self._context.custom_config.pydantic_config.use_typeddict_requests,
                )
                return (
                    self._context.core_utilities.convert_and_respect_annotation_metadata(
                        object_=request_param, annotation=type_hint
                    )
                    if can_tr_be_fern_model(request_param_tr, self._context.get_types())
                    else request_param
                )
            return request_param

        return get_json_body_for_inlined_request(
            self._context,
            self._get_properties(names_to_deconflict),
        )

    def _get_request_parameter_name(self) -> str:
        if self._endpoint.sdk_request is None:
            raise RuntimeError("Request body is referenced by SDKRequestBody is not defined")
        return self._endpoint.sdk_request.request_parameter_name.snake_case.safe_name

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return self._are_any_properties_optional

    def get_content(self) -> Optional[AST.Expression]:
        return None

    # HACK: This is a bit of a hack to deconflict parameter names when inlining the request body
    # since these parameters can conflict with the query and header properties, we need the name
    # of the body to deconflict them.
    def get_body_name(self) -> Optional[ir_types.Name]:
        return self._request_body.request_body_type.visit(
            container=lambda _: None,
            named=lambda t: t.name,
            primitive=lambda _: None,
            unknown=lambda: None,
        )

    def get_parameter_name_rewrites(self) -> Dict[ir_types.Name, str]:
        return self.parameter_name_rewrites
