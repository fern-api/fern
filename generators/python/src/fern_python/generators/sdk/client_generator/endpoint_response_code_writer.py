from typing import Any, Callable, Optional

from ..context.sdk_generator_context import SdkGeneratorContext
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

import fern.ir.resources as ir_types


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
        chunk_size_parameter: Optional[str] = None,
        is_raw_client: bool = False,
    ):
        self._context = context
        self._response = response
        self._errors = errors
        self._streaming_parameter = streaming_parameter
        self._is_async = is_async
        self._pagination = pagination
        self._pagination_snippet_config = pagination_snippet_config
        self._chunk_size_parameter = chunk_size_parameter
        self._is_raw_client = is_raw_client

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
        # Since we're not supporting streaming in raw clients, we only need the non-raw client code
        # For raw clients, this function should never be called
        if self._is_raw_client:
            # TODO(hughhan1): support streaming methods in raw clients.
            raise NotImplementedError("generating streaming methods for raw clients is not yet supported")

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
                writer.write_line("except Exception:")
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

        # Validation rules limit the type of the response object to be either
        # an object or optional object
        property_access_expression: Optional[AST.Expression] = None
        response_union = json_response.get_as_union()
        if response_union.type == "nestedPropertyAsResponse":
            response_body: ir_types.TypeReference = response_union.response_body_type
            response_body_union = response_body.get_as_union()
            response_property = (
                response_union.response_property.name.name.snake_case.safe_name
                if response_union.response_property is not None
                else None
            )
            if response_body_union.type == "container":
                response_container = response_body_union.container.get_as_union()
                if (
                    response_container.type == "optional" or response_container.type == "nullable"
                ) and response_property is not None:
                    property_access_expression = AST.Expression(
                        f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{response_property} if {EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE} is not None else {EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}"
                    )
            elif response_body_union.type == "named":
                response_named = self._context.pydantic_generator_context.get_declaration_for_type_id(
                    response_body_union.type_id
                )

                property_access_expression = response_named.shape.visit(
                    object=lambda _: AST.Expression(
                        f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{response_property}"
                    ),
                    alias=lambda alias_shape: self._handle_alias_type_property_access(
                        alias_shape=alias_shape, response_property=response_property
                    ),
                    enum=lambda _: None,
                    union=lambda _: None,
                    undiscriminated_union=lambda _: None,
                )

        if property_access_expression is not None:
            # If you are indeed accessing a property, set the parsed response to an intermediate variable
            # if we haven't already created it
            if not str(property_access_expression).startswith(
                "data"
            ) and EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE not in str(property_access_expression):
                writer.write_node(
                    AST.VariableDeclaration(
                        name=EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE, initializer=pydantic_parse_expression
                    )
                )

            # Then use the property accessed expression moving forward
            pydantic_parse_expression = property_access_expression

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
                custom=lambda _: raise_custom_pagination_error(),
            )
            if paginator is not None:
                paginator.write(writer=writer)
        else:
            # For non-raw clients, just return the parsed expression
            if not self._is_raw_client:
                writer.write("return ")
                writer.write_node(pydantic_parse_expression)
                writer.write_newline_if_last_line_not()
                return

            # For raw clients, wrap in HttpResponse/AsyncHttpResponse
            # Create a variable to store the parsed data
            if isinstance(pydantic_parse_expression.expression, AST.CodeWriter) and not str(
                pydantic_parse_expression.expression._code_writer
            ).startswith("data"):
                writer.write("_data = ")
                writer.write_node(pydantic_parse_expression)
                writer.write_newline_if_last_line_not()
                is_optional = str(pydantic_parse_expression.expression._code_writer).endswith(
                    f"if {EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE} is not None else None"
                )

            # Return wrapped in either HttpResponse or AsyncHttpResponse
            writer.write("return ")
            response_class = "AsyncHttpResponse" if self._is_async else "HttpResponse"
            writer.write_node(
                AST.ClassInstantiation(
                    class_=AST.ClassReference(
                        qualified_name_excluding_import=(),
                        import_=AST.ReferenceImport(
                            module=AST.Module.local(*self._context.core_utilities._module_path, "http_response"),
                            named_import=response_class,
                        ),
                    ),
                    kwargs=[
                        ("response", AST.Expression(EndpointResponseCodeWriter.RESPONSE_VARIABLE)),
                        ("data", AST.Expression("_data")),
                    ],
                )
            )
            if is_optional:
                writer.write("  # type: ignore")
            writer.write_newline_if_last_line_not()

    def _handle_alias_type_property_access(
        self, alias_shape: Any, response_property: Optional[str]
    ) -> Optional[AST.Expression]:
        """Handle property access for alias types, especially optional aliases"""
        if response_property is None:
            return None

        # Try to access resolved_type attribute safely
        resolved_type = alias_shape.resolved_type.get_as_union()
        if resolved_type.type == "container":
            container_type = resolved_type.container.get_as_union()
            if container_type.type == "optional" or container_type.type == "nullable":
                # For optional aliases, provide a safe access pattern that handles None
                # We use None as the fallback to ensure proper Optional typing
                return AST.Expression(
                    f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{response_property} if {EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE} is not None else None"
                )

        # Default case - just access the property directly
        return AST.Expression(f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{response_property}")

    def _handle_success_bytes(
        self,
        *,
        writer: AST.NodeWriter,
    ) -> None:
        writer.write("return ")
        writer.write_node(AST.Expression(f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.read()"))
        writer.write("  # type: ignore ")
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
        maybe_chunk_size_default = self._context.custom_config.default_bytes_stream_chunk_size
        defaulted_chunk_size_default = maybe_chunk_size_default if maybe_chunk_size_default is not None else "None"
        chunk_size_variable = "_chunk_size"
        writer.write_line(
            f'{chunk_size_variable} = request_options.get("chunk_size", {defaulted_chunk_size_default}) if request_options is not None else {defaulted_chunk_size_default}'
        )

        # For raw clients, wrap the generator in an HttpResponse
        if self._is_raw_client:
            response_class = "AsyncHttpResponse" if self._is_async else "HttpResponse"
            iter_method = self._get_iter_bytes_method(is_async=self._is_async)
            writer.write("return ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=AST.ClassReference(
                        qualified_name_excluding_import=(),
                        import_=AST.ReferenceImport(
                            module=AST.Module.local(*self._context.core_utilities._module_path, "http_response"),
                            named_import=response_class,
                        ),
                    ),
                    kwargs=[
                        ("response", AST.Expression(EndpointResponseCodeWriter.RESPONSE_VARIABLE)),
                        (
                            "data",
                            AST.Expression(
                                f"({EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} async for {EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} "
                                + f"in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{iter_method}(chunk_size={chunk_size_variable}))"
                                if self._is_async
                                else f"({EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} for {EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} "
                                + f"in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{iter_method}(chunk_size={chunk_size_variable}))"
                            ),
                        ),
                    ],
                )
            )
            writer.write_newline_if_last_line_not()
        else:
            # For non-raw clients, yield chunks directly
            if self._is_async:
                writer.write("async ")
            writer.write_line(
                f"for {EndpointResponseCodeWriter.FILE_CHUNK_VARIABLE} in {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.{self._get_iter_bytes_method(is_async=self._is_async)}(chunk_size={chunk_size_variable}):"
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
                    if self._is_raw_client:
                        # For raw clients, return HttpResponse/AsyncHttpResponse with data=None
                        response_class = "AsyncHttpResponse" if self._is_async else "HttpResponse"
                        writer.write("return ")
                        writer.write_node(
                            AST.ClassInstantiation(
                                class_=AST.ClassReference(
                                    qualified_name_excluding_import=(),
                                    import_=AST.ReferenceImport(
                                        module=AST.Module.local(
                                            *self._context.core_utilities._module_path, "http_response"
                                        ),
                                        named_import=response_class,
                                    ),
                                ),
                                kwargs=[
                                    ("response", AST.Expression(EndpointResponseCodeWriter.RESPONSE_VARIABLE)),
                                    ("data", AST.Expression("None")),
                                ],
                            )
                        )
                        writer.write_newline_if_last_line_not()
                    else:
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
                            bytes=lambda _: self._handle_success_bytes(writer=writer),
                        ),
                        bytes=lambda _: self._handle_success_bytes(writer=writer),
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

            for error in self._errors:
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
                if self._is_raw_client:
                    # For raw clients, return HttpResponse/AsyncHttpResponse with data=None
                    response_class = "AsyncHttpResponse" if self._is_async else "HttpResponse"
                    writer.write("return ")
                    writer.write_node(
                        AST.ClassInstantiation(
                            class_=AST.ClassReference(
                                qualified_name_excluding_import=(),
                                import_=AST.ReferenceImport(
                                    module=AST.Module.local(
                                        *self._context.core_utilities._module_path, "http_response"
                                    ),
                                    named_import=response_class,
                                ),
                            ),
                            kwargs=[
                                ("response", AST.Expression(EndpointResponseCodeWriter.RESPONSE_VARIABLE)),
                                ("data", AST.Expression("None")),
                            ],
                        )
                    )
                    writer.write_newline_if_last_line_not()
                else:
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
                    bytes=lambda _: self._handle_success_bytes(writer=writer),
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
                        bytes=lambda _: self._handle_success_bytes(writer=writer),
                    ),
                )

        if self._response is None or self._response.body is None:
            self._try_deserialize_json_response(writer=writer, response_handler=None)

        if len(self._errors) > 0:
            writer.write_line(
                f'if "{strategy.discriminant.wire_value}" in {EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE}:'
            )
            with writer.indent():
                for error in self._errors:
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
            # TODO: What is the case where you have a nested property as response, but no response property configured?
            nested_property_as_response=lambda response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                response.response_body_type
            ),
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


def raise_custom_pagination_error() -> None:
    raise NotImplementedError("Custom pagination is not supported yet")
