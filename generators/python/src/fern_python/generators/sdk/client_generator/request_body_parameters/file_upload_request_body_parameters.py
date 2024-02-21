from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST

from ...context.sdk_generator_context import SdkGeneratorContext
from .abstract_request_body_parameters import AbstractRequestBodyParameters

FILETYPE_DOCS = "See core.File for more documentation"


class FileUploadRequestBodyParameters(AbstractRequestBodyParameters):
    def __init__(
        self,
        endpoint: ir_types.HttpEndpoint,
        request: ir_types.FileUploadRequest,
        context: SdkGeneratorContext,
    ):
        self._endpoint = endpoint
        self._request = request
        self._context = context

    def get_parameters(self) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._request.properties:
            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_property_name(property),
                    type_hint=self._get_property_type(property),
                    docs=self._get_docs(property),
                ),
            )
        return parameters

    def _get_file_property_type(self, prop: ir_types.FileProperty) -> AST.TypeHint:
        file_type_hint = self._context.core_utilities.get_type_hint_of_file_types()
        maybe_file_array = (
            AST.TypeHint.list(file_type_hint) if prop.get_as_union().type == "fileArray" else file_type_hint
        )
        return maybe_file_array if not prop.get_as_union().is_optional else AST.TypeHint.optional(maybe_file_array)

    def _get_property_type(self, property: ir_types.FileUploadRequestProperty) -> AST.TypeHint:
        return property.visit(
            file=lambda x: self._get_file_property_type(x),
            body_property=lambda body_property: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                body_property.value_type
            ),
        )

    def _get_property_name(self, property: ir_types.FileUploadRequestProperty) -> str:
        return property.visit(
            file=self._get_file_property_name,
            body_property=self._get_body_property_name,
        )

    def _get_docs(self, property: ir_types.FileUploadRequestProperty) -> Optional[str]:
        return property.visit(
            file=lambda _: FILETYPE_DOCS,
            body_property=lambda body_property: body_property.docs,
        )

    def _get_file_property_name(self, property: ir_types.FileProperty) -> str:
        return property.get_as_union().key.name.snake_case.unsafe_name

    def _get_body_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.unsafe_name

    def get_json_body(self) -> Optional[AST.Expression]:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._request.properties:
                    property_as_union = property.get_as_union()
                    if property_as_union.type == "bodyProperty":
                        writer.write_line(
                            f'"{property_as_union.name.wire_value}": {self._get_body_property_name(property_as_union)},'
                        )
            writer.write_line("}")

        return self._context.core_utilities.remove_none_from_dict(AST.Expression(AST.CodeWriter(write)))

    def get_files(self) -> Optional[AST.Expression]:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._request.properties:
                    property_as_union = property.get_as_union()
                    if property_as_union.type == "file":
                        writer.write_line(
                            f'"{property_as_union.value.get_as_union().key.wire_value}": {self._get_file_property_name(property_as_union.value)},'
                        )
            writer.write_line("}")

        return self._context.core_utilities.remove_none_from_dict(AST.Expression(AST.CodeWriter(write)))

    def get_pre_fetch_statements(self) -> Optional[AST.CodeWriter]:
        return None

    def is_default_body_parameter_used(self) -> bool:
        return False

    def get_content(self) -> Optional[AST.Expression]:
        return None
