import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies.json import Json
from fern_python.external_dependencies.pydantic import Pydantic
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


class EndpointResponseCodeWriter:
    RESPONSE_VARIABLE = "_response"
    RESPONSE_JSON_VARIABLE = "_response_json"
    STREAM_TEXT_VARIABLE = "_text"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        endpoint: ir_types.HttpEndpoint,
        is_async: bool,
    ):
        self._context = context
        self._endpoint = endpoint
        self._is_async = is_async

    def get_writer(self) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            self._context.ir.error_discrimination_strategy.visit(
                status_code=lambda: self._write_status_code_discriminated_response_handler(
                    writer=writer,
                ),
                property=lambda strategy: self._write_property_discriminated_response_handler(
                    writer=writer, strategy=strategy
                ),
            )

        return AST.CodeWriter(write)

    def _handle_success_stream(self, *, writer: AST.NodeWriter, stream_response: ir_types.StreamingResponse) -> None:
        if self._is_async:
            writer.write("async ")
        writer.write_line(
            f"for {EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE} in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{self._get_iter_text_method(is_async=self._is_async)}(): "
        )
        with writer.indent():
            writer.write("yield ")
            writer.write_node(
                Pydantic.parse_obj_as(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        stream_response.data_event_type
                    ),
                    AST.Expression(Json.loads(AST.Expression(EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE))),
                )
            )
        writer.write_line("return")

    def _get_iter_text_method(self, *, is_async: bool) -> str:
        if is_async:
            return "aiter_text"
        else:
            return "iter_text"

    def _handle_success_json(
        self, *, writer: AST.NodeWriter, json_response: ir_types.JsonResponse, use_response_json: bool
    ) -> None:

        writer.write("return ")
        writer.write_node(
            Pydantic.parse_obj_as(
                self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    json_response.response_body_type
                ),
                AST.Expression(
                    f"{EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}"
                    if use_response_json
                    else f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.json()"
                ),
            )
        )
        writer.write_newline_if_last_line_not()

    def _write_status_code_discriminated_response_handler(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"if 200 <= {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if self._endpoint.sdk_response is None:
                writer.write_line("return")
            else:
                self._endpoint.sdk_response.visit(
                    json=lambda json_response: self._handle_success_json(
                        writer=writer, json_response=json_response, use_response_json=False
                    ),
                    maybe_streaming=raise_maybe_streaming_unsupported,
                    streaming=lambda stream_response: self._handle_success_stream(
                        writer=writer, stream_response=stream_response
                    ),
                    file_download=raise_file_download_unsupported,
                )

        for error in self._endpoint.errors.get_as_list():
            error_declaration = self._context.ir.errors[error.error.error_id]

            writer.write_line(
                f"if {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code == {error_declaration.status_code}:"
            )
            with writer.indent():
                writer.write("raise ")
                writer.write_node(
                    AST.ClassInstantiation(
                        class_=self._context.get_reference_to_error(error.error),
                        args=[
                            Pydantic.parse_obj_as(
                                self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                    error_declaration.type
                                ),
                                AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.json()"),
                            )
                        ]
                        if error_declaration.type is not None
                        else None,
                    )
                )
                writer.write_newline_if_last_line_not()

        self._try_deserialize_json_response(writer=writer)

        writer.write("raise ")
        writer.write_node(
            self._context.core_utilities.instantiate_api_error(
                body=AST.Expression(EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE),
                status_code=AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code"),
            )
        )
        writer.write_newline_if_last_line_not()

    def _write_property_discriminated_response_handler(
        self,
        *,
        writer: AST.NodeWriter,
        strategy: ir_types.ErrorDiscriminationByPropertyStrategy,
    ) -> None:
        if self._endpoint.response is not None:
            self._try_deserialize_json_response(writer=writer)

        writer.write_line(f"if 200 <= {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if self._endpoint.sdk_response is None:
                writer.write_line("return")
            else:
                self._endpoint.sdk_response.visit(
                    json=lambda json_response: self._handle_success_json(
                        writer=writer, json_response=json_response, use_response_json=True
                    ),
                    maybe_streaming=raise_maybe_streaming_unsupported,
                    streaming=lambda stream_response: self._handle_success_stream(
                        writer=writer, stream_response=stream_response
                    ),
                    file_download=raise_file_download_unsupported,
                )

        if self._endpoint.response is None:
            self._try_deserialize_json_response(writer=writer)

        if len(self._endpoint.errors.get_as_list()) > 0:
            writer.write_line(
                f'if "{strategy.discriminant.wire_value}" in {EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}:'
            )
            with writer.indent():
                for error in self._endpoint.errors.get_as_list():
                    error_declaration = self._context.ir.errors[error.error.error_id]

                    writer.write_line(
                        f'if {EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}["{strategy.discriminant.wire_value}"] == "{error_declaration.discriminant_value.wire_value}":'
                    )
                    with writer.indent():
                        writer.write("raise ")
                        writer.write_node(
                            AST.ClassInstantiation(
                                class_=self._context.get_reference_to_error(error.error),
                                args=[
                                    Pydantic.parse_obj_as(
                                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                            error_declaration.type
                                        ),
                                        AST.Expression(
                                            f'{EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}["{strategy.content_property.wire_value}"]'
                                        ),
                                    )
                                ]
                                if error_declaration.type is not None
                                else None,
                            )
                        )
                        writer.write_newline_if_last_line_not()

        writer.write("raise ")
        writer.write_node(
            self._context.core_utilities.instantiate_api_error(
                body=AST.Expression(EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE),
                status_code=AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code"),
            )
        )
        writer.write_newline_if_last_line_not()

    def _deserialize_json_response(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(
            f"{EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE} = {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.json()"
        )

    def _try_deserialize_json_response(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line("try:")
        with writer.indent():
            self._deserialize_json_response(writer=writer)
        writer.write("except ")
        writer.write_reference(Json.JSONDecodeError())
        writer.write_line(":")
        with writer.indent():
            writer.write("raise ")
            writer.write_node(
                self._context.core_utilities.instantiate_api_error(
                    body=AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.text"),
                    status_code=AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code"),
                )
            )
            writer.write_newline_if_last_line_not()

    def _get_response_body_type(self, response: ir_types.HttpResponse) -> AST.TypeHint:
        return response.visit(
            file_download=raise_file_download_unsupported,
            json=lambda json_response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                json_response.response_body_type
            ),
        )


def raise_file_download_unsupported(file_download_response: ir_types.FileDownloadResponse) -> Never:
    raise RuntimeError("File download is not supported")


def raise_maybe_streaming_unsupported(maybe_streaming_response: ir_types.MaybeStreamingResponse) -> Never:
    raise RuntimeError("Maybe streaming is not supported")
