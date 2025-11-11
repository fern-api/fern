from typing import List

import fern.ir.resources as ir_types
from ....context import FastApiGeneratorContext
from ..endpoint_parameter import EndpointParameter

from fern_python.codegen import AST
from fern_python.external_dependencies.fastapi import FastAPI


class FileUploadRequestFileParameter(EndpointParameter):
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        request_property: ir_types.FileProperty,
    ):
        super().__init__(context=context)
        self._request_property = request_property

    def get_name(self) -> str:
        return self._parameter_name()

    def _parameter_name(self) -> str:
        return self._request_property.get_as_union().key.name.snake_case.safe_name

    def _get_request_param_name(self) -> str:
        return self._parameter_name()

    def _get_unsafe_name(self) -> str:
        return self._parameter_name()

    def get_type(self) -> AST.TypeHint:
        return FastAPI.UploadFileType(
            is_optional=self._request_property.get_as_union().is_optional,
            is_list=self._request_property.get_as_union().type == "fileArray",
        )

    def get_default(self) -> AST.Expression:
        return FastAPI.UploadFile(
            is_optional=self._request_property.get_as_union().is_optional,
            is_list=self._request_property.get_as_union().type == "fileArray",
            variable_name=self._get_request_param_name(),
            wire_value=self._request_property.get_as_union().key.wire_value,
            docs=None,
        )


class FileUploadRequestBodyParameter(EndpointParameter):
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        request_property: ir_types.InlinedRequestBodyProperty,
    ):
        super().__init__(context=context)
        self._request_property = request_property

    def get_name(self) -> str:
        return self._parameter_name()

    def _parameter_name(self) -> str:
        return self._request_property.name.name.snake_case.safe_name

    def _get_request_param_name(self) -> str:
        return self._parameter_name()

    def _get_unsafe_name(self) -> str:
        return self._parameter_name()

    def get_type(self) -> AST.TypeHint:
        return self._context.pydantic_generator_context.get_type_hint_for_type_reference(
            self._request_property.value_type
        )

    def get_default(self) -> AST.Expression:
        return FastAPI.Body(variable_name=self._parameter_name(), wire_value=self._request_property.name.wire_value)


class FileUploadRequestEndpointParameters:
    def __init__(
        self,
        *,
        context: FastApiGeneratorContext,
        request: ir_types.FileUploadRequest,
    ):
        self._request = request

        self._parameters: List[EndpointParameter] = []
        for request_property in request.properties:
            union_request_property = request_property.get_as_union()
            if hasattr(union_request_property, "value") and isinstance(
                union_request_property.value, ir_types.FileProperty
            ):
                self._parameters.append(
                    FileUploadRequestFileParameter(context=context, request_property=union_request_property.value)
                )
            elif isinstance(union_request_property, ir_types.InlinedRequestBodyProperty):
                self._parameters.append(
                    FileUploadRequestBodyParameter(context=context, request_property=union_request_property)
                )
            else:
                raise ValueError(f"Unsupported request property type: {type(request_property)}")

    def get_parameters(self) -> List[EndpointParameter]:
        return self._parameters
