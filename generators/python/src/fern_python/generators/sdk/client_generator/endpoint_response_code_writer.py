from typing import Callable, List, Literal, Optional

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.codegen.ast.nodes.declarations.function.function_parameter import (
    FunctionParameter,
)
from fern_python.codegen.ast.nodes.declarations.function.named_function_parameter import (
    NamedFunctionParameter,
)
from fern_python.external_dependencies.httpx_sse import HttpxSSE
from fern_python.external_dependencies.json import Json
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext


# HACKHACK yes this is kinda duplicative of snippets,
# but we don't need the complexity of snippets here, we just
# need to reinvoke the function call with slightly tweaked params
class EndpointDummySnippetConfig:
    endpoint_name: str
    parameters: List[FunctionParameter]
    named_parameters: List[NamedFunctionParameter]

    def __init__(
        self, endpoint_name: str, parameters: List[FunctionParameter], named_parameters: List[NamedFunctionParameter]
    ) -> None:
        self.endpoint_name = endpoint_name
        self.parameters = parameters
        self.named_parameters = named_parameters


class EndpointResponseCodeWriter:
    RESPONSE_VARIABLE = "_response"
    PARSED_RESPONSE_VARIABLE = "_parsed_response"
    PARSED_RESPONSE_NEXT_VARIABLE = "_parsed_next"
    PAGINATION_GET_NEXT_VARIABLE = "_get_next"
    PAGINATION_HAS_NEXT_VARIABLE = "_has_next"
    PAGINATION_ITEMS_VARIABLE = "_items"
    RESPONSE_JSON_VARIABLE = "_response_json"
    STREAM_TEXT_VARIABLE = "_text"
    FILE_CHUNK_VARIABLE = "_chunk"
    EVENT_SOURCE_VARIABLE = "_event_source"
    SSE_VARIABLE = "_sse"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        endpoint: ir_types.HttpEndpoint,
        is_async: bool,
        pagination: Optional[ir_types.Pagination],
        dummy_snippet_config: EndpointDummySnippetConfig,
    ):
        self._context = context
        self._endpoint = endpoint
        self._is_async = is_async
        self._pagination = pagination
        self._dummy_snippet_config = dummy_snippet_config

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

    def _get_none_safe_property_condition(self, response_property: ir_types.ResponseProperty) -> Optional[str]:
        if response_property.property_path is None or len(response_property.property_path) == 0:
            return None
        condition = ""
        property_path = (response_property.property_path or []).copy()
        built_path = "_parsed_response."
        for idx, property in enumerate(property_path):
            if idx > 0:
                built_path += "."
                condition += " and "
            built_path += f"{property.snake_case.safe_name}"
            condition += f"{built_path} is not None"
        return f"if {condition}:"

    # Need to do null-safe dereferencing here, with some fallback value
    def _response_property_to_dot_access(self, response_property: ir_types.ResponseProperty) -> str:
        property_path = (response_property.property_path or []).copy()
        property_path.append(response_property.property.name.name)
        path_name = list(map(lambda name: name.snake_case.safe_name, property_path))
        return ".".join(path_name)

    def _write_dummy_snippet_to_paginate(
        self,
        *,
        writer: AST.NodeWriter,
        page_parameter: ir_types.RequestPropertyValue,
        type: Literal["cursor", "offset"],
    ) -> None:
        parameter_name = page_parameter.visit(
            body=lambda b: b.name.name.snake_case.safe_name, query=lambda q: q.name.name.snake_case.safe_name
        )
        writer.write(f"self.{self._dummy_snippet_config.endpoint_name}(")
        for parameter in self._dummy_snippet_config.parameters:
            # We currently assume the paging mechanism is a direct parameter (e.g. not nested)
            if parameter.name == parameter_name:
                if type == "offset":
                    # Here we assume the offset parameter is an integer
                    writer.write(f"{parameter.name} + 1")
                else:
                    writer.write(EndpointResponseCodeWriter.PARSED_RESPONSE_NEXT_VARIABLE)
            else:
                writer.write(parameter.name)
            writer.write(", ")

        for parameter in self._dummy_snippet_config.named_parameters:
            if parameter.name == parameter_name:
                if type == "offset":
                    # Here we assume the offset parameter is an integer
                    writer.write(f"{parameter.name}={parameter.name} + 1")
                else:
                    writer.write(f"{parameter.name}={EndpointResponseCodeWriter.PARSED_RESPONSE_NEXT_VARIABLE}")
            else:
                writer.write(f"{parameter.name}={parameter.name}")
            writer.write(", ")
        writer.write_line(")")

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
            writer.write(f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE} = ")
            writer.write_node(pydantic_parse_expression)

            # Has next
            # Always allow a next page if the response has a next property, for offset
            # pagination we're going to continue until there aren't any more pages
            pagination = self._pagination.get_as_union()
            if pagination.type == "cursor":
                # TODO: This is mirroring go for now, we should really bake in the types of the property_path into the
                # IR so we can do a quick check on the type and only do this conditional if the property can be null
                none_safe_condition = self._get_none_safe_property_condition(pagination.next)
                property_path_next_access = f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{self._response_property_to_dot_access(pagination.next)}"
                if none_safe_condition is not None:
                    writer.write_line(f"{EndpointResponseCodeWriter.PAGINATION_HAS_NEXT_VARIABLE} = False")
                    writer.write_line(f"{EndpointResponseCodeWriter.PAGINATION_GET_NEXT_VARIABLE} = None")

                    writer.write_line(none_safe_condition)
                    with writer.indent():
                        writer.write_line(
                            f"{EndpointResponseCodeWriter.PARSED_RESPONSE_NEXT_VARIABLE} = {property_path_next_access}"
                        )

                        writer.write_line(
                            f"{EndpointResponseCodeWriter.PAGINATION_HAS_NEXT_VARIABLE} = {EndpointResponseCodeWriter.PARSED_RESPONSE_NEXT_VARIABLE} is not None"
                        )

                        writer.write(f"{EndpointResponseCodeWriter.PAGINATION_GET_NEXT_VARIABLE} = lambda: ")
                        self._write_dummy_snippet_to_paginate(
                            writer=writer,
                            page_parameter=pagination.page.property,
                            type="cursor",
                        )
                else:
                    writer.write_line(
                        f"{EndpointResponseCodeWriter.PAGINATION_HAS_NEXT_VARIABLE} = {property_path_next_access} is not None"
                    )
                    writer.write_line(
                        f"{EndpointResponseCodeWriter.PARSED_RESPONSE_NEXT_VARIABLE} = {property_path_next_access}"
                    )
                    writer.write(f"{EndpointResponseCodeWriter.PAGINATION_GET_NEXT_VARIABLE} = lambda: ")
                    self._write_dummy_snippet_to_paginate(
                        writer=writer,
                        page_parameter=pagination.page.property,
                        type="cursor",
                    )
            else:
                page_parameter = self._pagination.get_as_union().page

                writer.write_line(f"{EndpointResponseCodeWriter.PAGINATION_HAS_NEXT_VARIABLE} = True")

                # Get next, only for offset, since cursor is handled in the above if statement
                writer.write(f"{EndpointResponseCodeWriter.PAGINATION_GET_NEXT_VARIABLE} = lambda: ")
                pagination_type = self._pagination.get_as_union().type
                self._write_dummy_snippet_to_paginate(
                    writer=writer,
                    page_parameter=page_parameter.property,
                    type=pagination_type,
                )

            # Items
            none_safe_condition = self._get_none_safe_property_condition(self._pagination.get_as_union().results)
            property_path_results_access = f"{EndpointResponseCodeWriter.PARSED_RESPONSE_VARIABLE}.{self._response_property_to_dot_access(self._pagination.get_as_union().results)}"
            if none_safe_condition is not None:
                writer.write_line(f"{EndpointResponseCodeWriter.PAGINATION_ITEMS_VARIABLE} = []")
                writer.write_line(none_safe_condition)
                with writer.indent():
                    writer.write_line(
                        f"{EndpointResponseCodeWriter.PAGINATION_ITEMS_VARIABLE} = {property_path_results_access}"
                    )
            else:
                writer.write_line(
                    f"{EndpointResponseCodeWriter.PAGINATION_ITEMS_VARIABLE} = {property_path_results_access}"
                )

            writer.write("return ")
            writer.write_node(
                self._context.core_utilities.instantiate_paginator(
                    items=AST.Expression(EndpointResponseCodeWriter.PAGINATION_ITEMS_VARIABLE),
                    has_next=AST.Expression(EndpointResponseCodeWriter.PAGINATION_HAS_NEXT_VARIABLE),
                    get_next=AST.Expression(EndpointResponseCodeWriter.PAGINATION_GET_NEXT_VARIABLE),
                    is_async=self._is_async,
                )
            )
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
                if self._endpoint.response is None or self._endpoint.response.body is None:
                    writer.write_line("return")
                else:
                    self._endpoint.response.body.visit(
                        json=lambda json_response: self._handle_success_json(
                            writer=writer, json_response=json_response, use_response_json=False
                        ),
                        streaming=lambda stream_response: self._handle_success_stream(
                            writer=writer, stream_response=stream_response
                        ),
                        file_download=lambda _: self._handle_success_file_download(writer=writer),
                        text=lambda _: self._handle_success_text(writer=writer),
                        stream_parameter=lambda _: raise_stream_parameter_unsupported(),
                    )

            # in streaming responses, we need to call read() or aread()
            # before deserializing or httpx will raise ResponseNotRead
            if (
                self._endpoint.response is not None
                and self._endpoint.response.body
                and (
                    self._endpoint.response.body.get_as_union().type == "streaming"
                    or self._endpoint.response.body.get_as_union().type == "fileDownload"
                )
            ):
                writer.write_line(
                    f"await {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.aread()"
                    if self._is_async
                    else f"{EndpointResponseCodeWriter.RESPONSE_VARIABLE}.read()"
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
        if self._endpoint.response is not None and self._endpoint.response.body is not None:
            self._try_deserialize_json_response(writer=writer)

        writer.write_line(f"if 200 <= {EndpointResponseCodeWriter.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if self._endpoint.response is None or self._endpoint.response.body is None:
                writer.write_line("return")
            else:
                self._endpoint.response.body.visit(
                    json=lambda json_response: self._handle_success_json(
                        writer=writer, json_response=json_response, use_response_json=True
                    ),
                    streaming=lambda stream_response: self._handle_success_stream(
                        writer=writer, stream_response=stream_response
                    ),
                    file_download=lambda _: self._handle_success_file_download(writer=writer),
                    text=lambda _: self._handle_success_text(writer=writer),
                    stream_parameter=raise_stream_parameter_unsupported(),
                )

        if self._endpoint.response is None or self._endpoint.response.body is None:
            self._try_deserialize_json_response(writer=writer, response_handler=None)

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

    def _get_response_body_type(self, response: ir_types.HttpResponse) -> Optional[AST.TypeHint]:
        print(f"response {response}")
        if response.body is not None:
            return response.body.visit(
                file_download=lambda _: AST.TypeHint.async_iterator(AST.TypeHint.bytes())
                if self._is_async
                else AST.TypeHint.iterator(AST.TypeHint.bytes()),
                json=lambda json_response: self._get_json_response_body_type(json_response),
                streaming=lambda streaming_response: self._get_streaming_response_data_type(streaming_response),
                text=lambda _: AST.TypeHint.str_(),
                stream_parameter=lambda _: raise_stream_parameter_unsupported(),
            )
        return None

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


def raise_stream_parameter_unsupported() -> Never:
    raise RuntimeError("stream parameter is unsupported")
