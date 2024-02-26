from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from .abstract_request_body_parameters import AbstractRequestBodyParameters


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

    def get_parameters(self) -> List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=self._get_request_parameter_name(),
                type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    self._request_body.request_body_type,
                    in_endpoint=True,
                ),
            )
        ]

    def get_json_body(self) -> Optional[AST.Expression]:
        return AST.Expression(self._get_request_parameter_name())

    def _get_request_parameter_name(self) -> str:
        if self._endpoint.sdk_request is None:
            raise RuntimeError("Request body is referenced by SDKRequestBody is not defined")
        return self._endpoint.sdk_request.request_parameter_name.snake_case.unsafe_name

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def get_pre_fetch_statements(self) -> Optional[AST.CodeWriter]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return False

    def get_content(self) -> Optional[AST.Expression]:
        return None
