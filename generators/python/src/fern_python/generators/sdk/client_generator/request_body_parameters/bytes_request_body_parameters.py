from typing import Dict, List, Optional

import fern.ir.resources as ir_types
from ...context.sdk_generator_context import SdkGeneratorContext
from .abstract_request_body_parameters import AbstractRequestBodyParameters

from fern_python.codegen import AST


class BytesRequestBodyParameters(AbstractRequestBodyParameters):
    def __init__(
        self,
        endpoint: ir_types.HttpEndpoint,
        request: ir_types.BytesRequest,
        context: SdkGeneratorContext,
    ):
        self._endpoint = endpoint
        self._request = request
        self._context = context

    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=self._get_request_parameter_name(),
                type_hint=AST.TypeHint.optional(AST.TypeHint.bytes_or_bytes_stream())
                if self._request.is_optional
                else AST.TypeHint.bytes_or_bytes_stream(),
                raw_type=ir_types.TypeReference.factory.primitive(
                    ir_types.PrimitiveType(
                        v_1=ir_types.PrimitiveTypeV1.STRING,
                        v_2=None,
                    ),
                ),
            )
        ]

    def _get_request_parameter_name(self) -> str:
        if self._endpoint.sdk_request is None:
            raise RuntimeError("Request body is referenced by SDKRequestBody is not defined")
        return self._endpoint.sdk_request.request_parameter_name.snake_case.safe_name

    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]:
        return None

    def get_files(self) -> Optional[AST.Expression]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return False

    def get_content(self) -> Optional[AST.Expression]:
        return AST.Expression(self._get_request_parameter_name())

    def get_parameter_name_rewrites(self) -> Dict[ir_types.Name, str]:
        return {}
