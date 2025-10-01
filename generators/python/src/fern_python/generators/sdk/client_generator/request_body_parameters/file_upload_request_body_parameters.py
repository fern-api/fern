from typing import Dict, List, Optional

import fern.ir.resources as ir_types
from ...context.sdk_generator_context import SdkGeneratorContext
from ..constants import DEFAULT_BODY_PARAMETER_VALUE
from .abstract_request_body_parameters import AbstractRequestBodyParameters

from fern_python.codegen import AST
from fern_python.external_dependencies.json import Json

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

    def get_parameters(self, names_to_deconflict: Optional[List[str]] = None) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._request.properties:
            type_hint = self._get_property_type(property)
            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_property_name(property),
                    type_hint=type_hint,
                    docs=self._get_docs(property),
                    raw_type=self._get_raw_property_type(property),
                    raw_name=self._get_raw_property_name(property),
                    initializer=AST.Expression(DEFAULT_BODY_PARAMETER_VALUE) if type_hint.is_optional else None,
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
                body_property.value_type,
                # This is a temporary flag introduced due to an oversight in the `use_typeddict_requests` flag implementation.
                # Given that TypedDicts have already been released, we need to gate this with a flag specific to file upload
                # requests.
                in_endpoint=self._context.custom_config.use_typeddict_requests
                and self._context.custom_config.use_typeddict_requests_for_file_upload,
            ),
        )

    def _get_raw_file_property_type(self, prop: ir_types.FileProperty) -> ir_types.TypeReference:
        return (
            ir_types.TypeReference.factory.container(
                ir_types.ContainerType.factory.list_(
                    ir_types.TypeReference.factory.primitive(
                        ir_types.PrimitiveType(
                            v_1=ir_types.PrimitiveTypeV1.STRING,
                            v_2=None,
                        )
                    )
                )
            )
            if prop.get_as_union().type == "fileArray"
            else ir_types.TypeReference.factory.primitive(
                ir_types.PrimitiveType(
                    v_1=ir_types.PrimitiveTypeV1.STRING,
                    v_2=None,
                )
            )
        )

    def _get_raw_property_type(self, property: ir_types.FileUploadRequestProperty) -> ir_types.TypeReference:
        return property.visit(
            file=lambda x: self._get_raw_file_property_type(x),
            body_property=lambda body_property: body_property.value_type,
        )

    def _get_file_property_raw_name(self, property: ir_types.FileProperty) -> str:
        return property.get_as_union().key.wire_value

    def _get_body_property_raw_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.wire_value

    def _get_raw_property_name(self, property: ir_types.FileUploadRequestProperty) -> str:
        return property.visit(
            file=self._get_file_property_raw_name,
            body_property=self._get_body_property_raw_name,
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
        return property.get_as_union().key.name.snake_case.safe_name

    def _get_body_property_name(self, property: ir_types.InlinedRequestBodyProperty) -> str:
        return property.name.name.snake_case.safe_name

    def get_json_body(self, names_to_deconflict: Optional[List[str]] = None) -> Optional[AST.Expression]:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._request.properties:
                    property_as_union = property.get_as_union()
                    if property_as_union.type == "bodyProperty" and property_as_union.content_type is not None:
                        continue
                    elif property_as_union.type == "bodyProperty":
                        writer.write_line(
                            f'"{property_as_union.name.wire_value}": {self._get_body_property_name(property_as_union)},'
                        )
            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write))

    def get_files(self) -> Optional[AST.Expression]:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("{")
            with writer.indent():
                for property in self._request.properties:
                    type_hint = self._get_property_type(property)
                    property_as_union = property.get_as_union()
                    if property_as_union.type == "bodyProperty" and property_as_union.content_type is not None:
                        if type_hint.is_optional:
                            writer.write_line("**(")
                            with writer.indent():
                                writer.write(f'{{"{property_as_union.name.wire_value}": (None, ')
                                expression = AST.Expression(
                                    self._context.core_utilities.jsonable_encoder(
                                        AST.Expression(property_as_union.name.wire_value)
                                    )
                                )
                                if property_as_union.content_type == "text/plain":
                                    writer.write_node(expression)
                                else:
                                    writer.write_node(AST.Expression(Json.dumps(expression)))
                                writer.write_line(f', "{property_as_union.content_type}")}}')
                                writer.write_line(f"if {property_as_union.name.wire_value} is not OMIT ")
                                writer.write_line("else {}")
                            writer.write_line("),")
                        else:
                            writer.write(f'"{property_as_union.name.wire_value}": (None, ')
                            writer.write_node(
                                AST.Expression(
                                    Json.dumps(
                                        AST.Expression(
                                            self._context.core_utilities.jsonable_encoder(
                                                AST.Expression(property_as_union.name.wire_value)
                                            )
                                        )
                                    )
                                )
                            )
                            writer.write_line(f', "{property_as_union.content_type}"),')
                    elif property_as_union.type == "file":

                        def write_file_property(writer: AST.NodeWriter, file_property: ir_types.FileProperty) -> None:
                            file_property_as_union = file_property.get_as_union()
                            if file_property_as_union.content_type is not None:
                                writer.write(f'"{file_property_as_union.key.wire_value}": ')
                                writer.write_node(
                                    self._context.core_utilities.with_content_type(
                                        AST.Expression(
                                            f'file={file_property_as_union.key.wire_value}, default_content_type="{file_property_as_union.content_type}"'
                                        )
                                    )
                                )
                            else:
                                writer.write(
                                    f'"{file_property_as_union.key.wire_value}": {self._get_file_property_name(file_property)}'
                                )

                        if type_hint.is_optional:
                            writer.write_line("**(")
                            with writer.indent():
                                writer.write("{")
                                write_file_property(writer, property_as_union.value)
                                writer.write("} ")
                                writer.write_line(
                                    f"if {property_as_union.value.get_as_union().key.wire_value} is not None "
                                )
                                writer.write_line("else {}")
                            writer.write_line("),")
                        else:
                            write_file_property(writer, property_as_union.value)
                            writer.write_line(",")

            writer.write_line("}")

        return AST.Expression(AST.CodeWriter(write))

    def is_default_body_parameter_used(self) -> bool:
        return False

    def get_content(self) -> Optional[AST.Expression]:
        return None

    def get_parameter_name_rewrites(self) -> Dict[ir_types.Name, str]:
        return {}
