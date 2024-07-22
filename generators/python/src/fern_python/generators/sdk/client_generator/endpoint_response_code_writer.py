from typing import Callable, Optional

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies.httpx_sse import HttpxSSE
from fern_python.external_dependencies.json import Json
from fern_python.generators.sdk.client_generator.pagination.abstract_paginator import (
    PaginationSnippetConfig,
)
from fern_python.generators.sdk.client_generator.pagination.cursor import (
    CursorPagination,
)
from fern_python.generators.sdk.client_generator.pagination.offset import (
    OffsetPagination,
)
from fern_python.generators.sdk.client_generator.streaming.utilities import (
    StreamingParameterType,
)

from ..context.sdk_generator_context import SdkGeneratorContext


class EndpointResponseCodeWriter:
    RESPONSE_VARIABLE = "_response"
    PARSED_RESPONSE_VARIABLE = "_parsed_response"
    RESPONSE_JSON_VARIABLE = "_response_json"
    STREAM_TEXT_VARIABLE = "_text"
    FILE_CHUNK_VARIABLE = "_chunk"
    EVENT_SOURCE_VARIABLE = "_event_source"
    SSE_VARIABLE = "_sse"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        response: Optional[ir_types.HttpResponse],
        errors: ir_types.ResponseErrors,
        is_async: bool,
        streaming_parameter: Optional[StreamingParameterType] = None,
        pagination: Optional[ir_types.Pagination],
        pagination_snippet_config: PaginationSnippetConfig,
    ):
        self._context = context
        self._response = response
        self._errors = errors
        self._streaming_parameter = streaming_parameter
        self._is_async = is_async
        self._pagination = pagination
        self._pagination_snippet_config = pagination_snippet_config

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
        stream_response_union = stream_response.get_as_union()
        if stream_response_union.type == "sse":
            writer.write(f"{EndpointResponseCodeWriter.EVENT_SOURCE_VARIABLE} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    HttpxSSE.EVENT_SOURCE, [AST.Expression(EndpointResponseCodeWriter.RESPONSE_VARIABLE)]
                )
            )
            writer.write_newline_if_last_line_not()
            if self._is_async:
                writer.write("async ")
            writer.write_line(
                f"for {EndpointResponseCodeWriter.SSE_VARIABLE} in {EndpointResponseCodeWriter.EVENT_SOURCE_VARIABLE}.{self._get_iter_sse_method(is_async=self._is_async)}():"
            )
            with writer.indent():
                if stream_response_union.terminator is not None:
                    writer.write_line(
                        f'if {EndpointResponseCodeWriter.SSE_VARIABLE}.data == "{stream_response_union.terminator}":'
                    )
                    with writer.indent():
                        writer.write_line("return")
                writer.write_line("try:")
                with writer.indent():
                    writer.write("yield ")
                    writer.write_node(
                        self._context.core_utilities.get_construct(
                            self._get_streaming_response_data_type(stream_response),
                            AST.Expression(
                                Json.loads(AST.Expression(f"{EndpointResponseCodeWriter.SSE_VARIABLE}.data"))
                            ),
                        ),
                    )
                    writer.write_newline_if_last_line_not()
                writer.write_line("except:")
                with writer.indent():
                    writer.write_line("pass")
        else:
            if self._is_async:
                writer.write("async ")
            writer.write_line(
                f"for {EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE} in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{self._get_iter_lines_method(is_async=self._is_async)}(): "
            )
            with writer.indent():
                writer.write_line("try:")
                with writer.indent():
                    # handle stream termination
                    if stream_response_union.type == "json" and stream_response_union.terminator is not None:
                        writer.write_line(
                            f'if {EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE} == "{stream_response_union.terminator}":'
                        )
                        with writer.indent():
                            writer.write_line("return")
                    # handle stream message that is empty
                    writer.write_line(f"if len({EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE}) == 0:")
                    with writer.indent():
                        writer.write_line("continue")
                    # handle message
                    writer.write("yield ")
                    writer.write_node(
                        self._context.core_utilities.get_construct(
                            self._get_streaming_response_data_type(stream_response),
                            AST.Expression(Json.loads(AST.Expression(EndpointResponseCodeWriter.STREAM_TEXT_VARIABLE))),
                        ),
                    )
                    writer.write_newline_if_last_line_not()
                writer.write_line("except:")
                with writer.indent():
                    writer.write_line("pass")

        writer.write_line("return")

    def _get_iter_lines_method(self, *, is_async: bool) -> str:
        if is_async:
            return "aiter_lines"
        else:
            return "iter_lines"

    def _get_iter_sse_method(self, *, is_async: bool) -> str:
        if is_async:
            return "aiter_sse"
        else:
            return "iter_sse"

    def _handle_success_json(
        self, *, writer: AST.NodeWriter, json_response: ir_types.JsonResponse, use_response_json: bool
    ) -> None:
        pydantic_parse_expression = self._context.core_utilities.get_construct(
            self._get_json_response_body_type(json_response),
            AST.Expression(
                f"{EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}"
                if use_response_json
                else f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.json()"
            ),
        )
        if self._pagination is not None:
            paginator = self._pagination.visit(
                cursor=lambda cursor: CursorPagination(
                    context=self._context,
                    is_async=self._is_async,
                    pydantic_parse_expression=pydantic_parse_expression,
                    config=self._pagination_snippet_config,
                    cursor=cursor,
                ),
                offset=lambda offset: OffsetPagination(
                    context=self._context,
                    is_async=self._is_async,
                    pydantic_parse_expression=pydantic_parse_expression,
                    config=self._pagination_snippet_config,
                    offset=offset,
                ),
            )
            paginator.write(writer=writer)
        else:
            writer.write("return ")
            writer.write_node(pydantic_parse_expression)
        writer.write_newline_if_last_line_not()

    def _handle_success_text(
        self,
        *,
        writer: AST.NodeWriter,
    ) -> None:
        writer.write("return ")
        writer.write_node(AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.text"))
        writer.write("  # type: ignore ")
        writer.write_newline_if_last_line_not()

    def _handle_success_file_download(self, *, writer: AST.NodeWriter) -> None:
        if self._is_async:
            writer.write("async ")
        writer.write_line(
            f"for {EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{self._get_iter_bytes_method(is_async=self._is_async)}(): "
        )
        with writer.indent():
            writer.write(f"yield {EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE}")
        writer.write_newline_if_last_line_not()
        writer.write_line("return")

    def _get_iter_bytes_method(self, *, is_async: bool) -> str:
        if is_async:
            return "aiter_bytes"
        else:
            return "iter_bytes"

    def _write_status_code_discriminated_response_handler(self, *, writer: AST.NodeWriter) -> None:
        def handle_endpoint_response(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if 200 <= {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code < 300:")
            with writer.indent():
                if self._response is None or self._response.body is None:
                    writer.write_line("return")
                else:
                    self._response.body.visit(
                        json=lambda json_response: self._handle_success_json(
                            writer=writer, json_response=json_response, use_response_json=False
                        ),
                        streaming=lambda stream_response: self._handle_success_stream(
                            writer=writer, stream_response=stream_response
                        ),
                        file_download=lambda _: self._handle_success_file_download(writer=writer),
                        text=lambda _: self._handle_success_text(writer=writer),
                        stream_parameter=lambda stream_param_response: self._handle_success_stream(
                            writer=writer, stream_response=stream_param_response.stream_response
                        )
                        if self._streaming_parameter == "streaming"
                        else stream_param_response.non_stream_response.visit(
                            json=lambda json_response: self._handle_success_json(
                                writer=writer, json_response=json_response, use_response_json=False
                            ),
                            file_download=lambda _: self._handle_success_file_download(writer=writer),
                            text=lambda _: self._handle_success_text(writer=writer),
                        ),
                    )

            # in streaming responses, we need to call read() or aread()
            # before deserializing or httpx will raise ResponseNotRead
            if (
                self._response is not None
                and self._response.body
                and (
                    self._response.body.get_as_union().type == "streaming"
                    or self._response.body.get_as_union().type == "fileDownload"
                    or self._streaming_parameter == "streaming"
                )
            ):
                writer.write_line(
                    f"await {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.aread()"
                    if self._is_async
                    else f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.read()"
                )

            for error in self._errors.get_as_list():
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
                                self._context.core_utilities.get_construct(
                                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                        error_declaration.type
                                    ),
                                    AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.json()"),
                                )
                            ]
                            if error_declaration.type is not None
                            else [],
                        )
                    )
                    writer.write_newline_if_last_line_not()

        self._try_deserialize_json_response(writer=writer, response_handler=handle_endpoint_response)

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
        if self._response is not None and self._response.body is not None:
            self._try_deserialize_json_response(writer=writer)

        writer.write_line(f"if 200 <= {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if self._response is None or self._response.body is None:
                writer.write_line("return")
            else:
                self._response.body.visit(
                    json=lambda json_response: self._handle_success_json(
                        writer=writer, json_response=json_response, use_response_json=True
                    ),
                    streaming=lambda stream_response: self._handle_success_stream(
                        writer=writer, stream_response=stream_response
                    ),
                    file_download=lambda _: self._handle_success_file_download(writer=writer),
                    text=lambda _: self._handle_success_text(writer=writer),
                    stream_parameter=lambda stream_param_response: self._handle_success_stream(
                        writer=writer, stream_response=stream_param_response.stream_response
                    )
                    if self._streaming_parameter == "streaming"
                    else stream_param_response.non_stream_response.visit(
                        json=lambda json_response: self._handle_success_json(
                            writer=writer, json_response=json_response, use_response_json=False
                        ),
                        file_download=lambda _: self._handle_success_file_download(writer=writer),
                        text=lambda _: self._handle_success_text(writer=writer),
                    ),
                )

        if self._response is None or self._response.body is None:
            self._try_deserialize_json_response(writer=writer, response_handler=None)

        if len(self._errors.get_as_list()) > 0:
            writer.write_line(
                f'if "{strategy.discriminant.wire_value}" in {EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}:'
            )
            with writer.indent():
                for error in self._errors.get_as_list():
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
                                    self._context.core_utilities.get_construct(
                                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                            error_declaration.type
                                        ),
                                        AST.Expression(
                                            f'{EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}["{strategy.content_property.wire_value}"]'
                                        ),
                                    )
                                ]
                                if error_declaration.type is not None
                                else [],
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

    def _try_deserialize_json_response(
        self, *, writer: AST.NodeWriter, response_handler: Optional[Callable[[AST.NodeWriter], None]] = None
    ) -> None:
        writer.write_line("try:")
        with writer.indent():
            if response_handler is not None:
                response_handler(writer)
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

    def _get_json_response_body_type(
        self,
        json_response: ir_types.JsonResponse,
    ) -> AST.TypeHint:
        return json_response.visit(
            response=lambda response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                response.response_body_type
            ),
            nested_property_as_response=lambda _: raise_json_nested_property_as_response_unsupported(),
        )

    def _get_streaming_response_data_type(self, streaming_response: ir_types.StreamingResponse) -> AST.TypeHint:
        union = streaming_response.get_as_union()
        if union.type == "json":
            return self._context.pydantic_generator_context.get_type_hint_for_type_reference(union.payload)
        if union.type == "sse":
            return self._context.pydantic_generator_context.get_type_hint_for_type_reference(union.payload)
        if union.type == "text":
            return AST.TypeHint.str_()
        raise RuntimeError(f"{union.type} streaming response is unsupported")


def raise_json_nested_property_as_response_unsupported() -> Never:
    raise RuntimeError("nested property json response is unsupported")
