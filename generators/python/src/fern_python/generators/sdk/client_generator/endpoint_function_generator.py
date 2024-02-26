from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies import HttpX, UrlLibParse
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    get_base_url,
    get_base_url_property_name,
)
from fern_python.snippet import SnippetWriter
from fern_python.source_file_factory import SourceFileFactory

from ..core_utilities.client_wrapper_generator import ClientWrapperGenerator
from .generated_root_client import GeneratedRootClient
from .request_body_parameters import (
    AbstractRequestBodyParameters,
    BytesRequestBodyParameters,
    FileUploadRequestBodyParameters,
    InlinedRequestBodyParameters,
    ReferencedRequestBodyParameters,
)

HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveType.STRING,
        ir_types.PrimitiveType.INTEGER,
        ir_types.PrimitiveType.DOUBLE,
        ir_types.PrimitiveType.BOOLEAN,
    ]
)


@dataclass
class GeneratedEndpointFunction:
    function: AST.FunctionDeclaration
    is_default_body_parameter_used: bool
    snippet: Optional[AST.Expression]


class EndpointFunctionGenerator:
    REQUEST_OPTIONS_VARIABLE = "request_options"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
        client_wrapper_member_name: str,
        is_async: bool,
        generated_root_client: GeneratedRootClient,
        snippet_writer: SnippetWriter,
    ):
        self._context = context
        self._package = package
        self._service = service
        self._endpoint = endpoint
        self._idempotency_headers = idempotency_headers
        self._is_async = is_async
        self._client_wrapper_member_name = client_wrapper_member_name
        self._generated_root_client = generated_root_client
        self.snippet_writer = snippet_writer

    def generate(self) -> GeneratedEndpointFunction:
        is_primitive: bool = (
            self._endpoint.request_body.visit(
                inlined_request_body=lambda _: False,
                reference=lambda referenced_request_body: self._is_httpx_primitive_data(
                    type_reference=referenced_request_body.request_body_type, allow_optional=True
                ),
                file_upload=lambda _: False,
                bytes=lambda _: False,
            )
            if self._endpoint.request_body is not None
            else False
        )

        request_body_parameters: Optional[AbstractRequestBodyParameters] = (
            self._endpoint.request_body.visit(
                inlined_request_body=lambda inlined_request_body: InlinedRequestBodyParameters(
                    endpoint=self._endpoint,
                    request_body=inlined_request_body,
                    context=self._context,
                ),
                reference=lambda referenced_request_body: ReferencedRequestBodyParameters(
                    endpoint=self._endpoint,
                    request_body=referenced_request_body,
                    context=self._context,
                ),
                file_upload=lambda file_upload_request: FileUploadRequestBodyParameters(
                    endpoint=self._endpoint, request=file_upload_request, context=self._context
                ),
                bytes=lambda bytes_request: BytesRequestBodyParameters(
                    endpoint=self._endpoint, request=bytes_request, context=self._context
                ),
            )
            if self._endpoint.request_body is not None
            else None
        )
        named_parameters = self._get_endpoint_named_parameters(
            service=self._service,
            endpoint=self._endpoint,
            request_body_parameters=request_body_parameters,
            idempotency_headers=self._idempotency_headers,
        )
        endpoint_snippet = self._generate_endpoint_snippet(
            package=self._package,
            service=self._service,
            endpoint=self._endpoint,
            generated_root_client=self._generated_root_client,
            snippet_writer=self.snippet_writer,
            is_async=self._is_async,
        )
        function_declaration = AST.FunctionDeclaration(
            name=get_endpoint_name(self._endpoint),
            is_async=self._is_async,
            docstring=self._get_docstring_for_endpoint(
                endpoint=self._endpoint,
                named_parameters=named_parameters,
                path_parameters=self._endpoint.all_path_parameters,
                snippet=endpoint_snippet,
            ),
            signature=AST.FunctionSignature(
                parameters=self._get_endpoint_path_parameters(),
                named_parameters=named_parameters,
                return_type=(
                    self._get_response_body_type(self._endpoint.response, self._is_async)
                    if self._endpoint.response is not None
                    else AST.TypeHint.none()
                ),
            ),
            body=self._create_endpoint_body_writer(
                service=self._service,
                endpoint=self._endpoint,
                idempotency_headers=self._idempotency_headers,
                request_body_parameters=request_body_parameters,
                is_async=self._is_async,
                is_primitive=is_primitive,
            ),
        )
        return GeneratedEndpointFunction(
            function=function_declaration,
            is_default_body_parameter_used=request_body_parameters is not None,
            snippet=endpoint_snippet,
        )

    def _get_endpoint_path_parameters(
        self,
    ) -> List[AST.FunctionParameter]:
        parameters: List[AST.FunctionParameter] = []
        for path_parameter in self._endpoint.all_path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                parameters.append(
                    AST.FunctionParameter(
                        name=get_parameter_name(path_parameter.name),
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            path_parameter.value_type,
                            in_endpoint=True,
                        ),
                    ),
                )
        return parameters

    def _get_endpoint_named_parameters(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        request_body_parameters: Optional[AbstractRequestBodyParameters],
        idempotency_headers: List[ir_types.HttpHeader],
    ) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []

        for query_parameter in endpoint.query_parameters:
            if not self._is_type_literal(type_reference=query_parameter.value_type):
                query_parameter_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    query_parameter.value_type,
                    in_endpoint=True,
                )
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(query_parameter.name.name),
                        docs=query_parameter.docs,
                        type_hint=self._get_typehint_for_query_param(query_parameter, query_parameter_type_hint),
                    ),
                )

        if request_body_parameters is not None:
            parameters.extend(request_body_parameters.get_parameters())

        for header in service.headers + endpoint.headers:
            if not self._is_header_literal(header):
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(header.name.name),
                        docs=header.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            header.value_type,
                            in_endpoint=True,
                        ),
                    ),
                )

        # Always include the idempotency header parameters second to last.
        if endpoint.idempotent:
            for header in idempotency_headers:
                if not self._is_header_literal(header):
                    parameters.append(
                        AST.NamedFunctionParameter(
                            name=get_parameter_name(header.name.name),
                            docs=header.docs,
                            type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                header.value_type,
                                in_endpoint=True,
                            ),
                        ),
                    )
        # Always include request options last.
        parameters.append(
            AST.NamedFunctionParameter(
                name=EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE,
                docs="Request-specific configuration.",
                type_hint=AST.TypeHint.optional(
                    AST.TypeHint(self._context.core_utilities.get_reference_to_request_options())
                ),
            ),
        )

        return parameters

    def _create_endpoint_body_writer(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
        request_body_parameters: Optional[AbstractRequestBodyParameters],
        is_async: bool,
        is_primitive: bool,
    ) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            request_pre_fetch_statements = (
                request_body_parameters.get_pre_fetch_statements() if request_body_parameters is not None else None
            )
            if request_pre_fetch_statements is not None:
                writer.write_node(AST.Expression(request_pre_fetch_statements))

            json_request_body = request_body_parameters.get_json_body() if request_body_parameters is not None else None
            encoded_json_request_body = (
                self._context.core_utilities.jsonable_encoder(json_request_body)
                if json_request_body is not None
                else None
            )

            method = endpoint.method.visit(
                get=lambda: "GET",
                post=lambda: "POST",
                put=lambda: "PUT",
                patch=lambda: "PATCH",
                delete=lambda: "DELETE",
            )

            def write_request_body(writer: AST.NodeWriter) -> None:
                if is_primitive:
                    if encoded_json_request_body:
                        writer.write_node(encoded_json_request_body)
                else:
                    # If there's an existing request body:
                    #   - Use it if the additional body params are none (e.g. request options has no impact)
                    #   - If additional body params is not none, json encode it and spread both dicts into a new one
                    #      - NOTE: With the is_primitive bail out, we do not acknowledge the additional body parameters,
                    #        to not have to merge together an integer and a hash, for example
                    # If there is not an existing request body, send the encoded dict
                    additional_parameters = (
                        f"{EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_body_parameters')"
                    )
                    additional_parameters_defaulted = f"{EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_body_parameters', {'{}'})"
                    json_encoded_additional_params = self._context.core_utilities.jsonable_encoder(
                        self._context.core_utilities.remove_none_from_dict(
                            AST.Expression(additional_parameters_defaulted)
                        )
                    )
                    if encoded_json_request_body:
                        writer.write_node(encoded_json_request_body)
                        writer.write(
                            f" if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is None or {additional_parameters} is None else"
                        )
                        writer.write(" {**")
                        writer.write_node(encoded_json_request_body)
                        writer.write(", **(")
                        writer.write_node(json_encoded_additional_params)
                        writer.write(")}")
                    else:
                        writer.write_node(json_encoded_additional_params)
                        writer.write(f" if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None else None")

            is_streaming = (
                True
                if endpoint.response is not None
                and (
                    endpoint.response.get_as_union().type == "streaming"
                    or endpoint.response.get_as_union().type == "fileDownload"
                )
                else False
            )
            response_code_writer = EndpointResponseCodeWriter(
                context=self._context, endpoint=endpoint, is_async=is_async
            )

            timeout_default = (
                "None"
                if self._context.custom_config.timeout_in_seconds == "infinity"
                else f"{self._context.custom_config.timeout_in_seconds}"
            )
            timeout = AST.Expression(
                f"{EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('timeout_in_seconds') if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None and {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('timeout_in_seconds') is not None else {timeout_default}"
            )
            files = (
                request_body_parameters.get_files()
                if request_body_parameters is not None and request_body_parameters.get_files() is not None
                else None
            )
            writer.write_node(
                HttpX.make_request(
                    is_streaming=is_streaming,
                    is_async=is_async,
                    url=(
                        self._get_environment_as_str(endpoint=endpoint)
                        if is_endpoint_path_empty(endpoint)
                        else UrlLibParse.urljoin(
                            self._get_environment_as_str(endpoint=endpoint),
                            self._get_path_for_endpoint(endpoint),
                        )
                    ),
                    method=method,
                    query_parameters=self._get_query_parameters_for_endpoint(endpoint=endpoint),
                    request_body=AST.Expression(AST.CodeWriter(write_request_body))
                    if (method != "GET" and method != "DELETE")
                    else None,
                    content=request_body_parameters.get_content() if request_body_parameters is not None else None,
                    files=self._context.core_utilities.httpx_tuple_converter(files) if files is not None else None,
                    response_variable_name=EndpointResponseCodeWriter.RESPONSE_VARIABLE,
                    headers=self._get_headers_for_endpoint(
                        service=service, endpoint=endpoint, idempotency_headers=idempotency_headers
                    ),
                    auth=None,
                    timeout=timeout,
                    response_code_writer=response_code_writer.get_writer(),
                    reference_to_client=AST.Expression(
                        f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME}"
                    ),
                )
            )

        return AST.CodeWriter(write)

    def _get_docstring_for_endpoint(
        self,
        endpoint: ir_types.HttpEndpoint,
        named_parameters: List[AST.NamedFunctionParameter],
        path_parameters: List[ir_types.PathParameter],
        snippet: Optional[AST.Expression],
    ) -> Optional[AST.CodeWriter]:
        if snippet is None and endpoint.docs is None and len(named_parameters) == 0 and len(path_parameters) == 0:
            return None

        # Consolidate the named parameters and path parameters in a single list.
        parameters: List[AST.NamedFunctionParameter] = []
        parameters = self._named_parameters_from_path_parameters(path_parameters)
        parameters.extend(named_parameters)

        def write(writer: AST.NodeWriter) -> None:
            if endpoint.docs is not None:
                writer.write_line(endpoint.docs)
            if len(parameters) == 0 and snippet is None:
                return
            if endpoint.docs is not None:
                # Include a line between the endpoint docs and field docs.
                writer.write_line()
            if len(parameters) > 0:
                writer.write_line("Parameters:")
                with writer.indent():
                    for i, param in enumerate(parameters):
                        if i > 0:
                            writer.write_line()

                        if param.docs is None:
                            writer.write(f"- {param.name}: ")
                            if param.type_hint is not None:
                                writer.write_node(param.type_hint)
                            writer.write_line(".")
                            continue

                        split = param.docs.split("\n")
                        if len(split) == 1:
                            writer.write(f"- {param.name}: ")
                            if param.type_hint is not None:
                                writer.write_node(param.type_hint)
                            writer.write_line(f". {param.docs}")
                            continue

                        # Handle multi-line comments at the same level of indentation for the same field,
                        # e.g.
                        #
                        #  - userId: str. This is a multi-line comment.
                        #                 This one has three lines
                        #                 in total.
                        #
                        #  - request: Request. The request body.
                        #
                        indent = ""
                        for i, line in enumerate(split):
                            if i == 0:
                                # Determine the level of indentation we need by capturing the length
                                # before and after we write the type hint.
                                writer.write(f"- {param.name}: ")
                                before = writer.size()
                                if param.type_hint is not None:
                                    writer.write_node(param.type_hint)
                                after = writer.size()
                                writer.write_line(f". {line}")
                                indent = " " * (len(param.name) + (after - before) + 4)
                                continue
                            writer.write(f" {indent} {line}")
                            if i < len(split) - 1:
                                writer.write_line()
            if snippet is not None:
                if endpoint.docs is not None or len(parameters) > 0:
                    # Include a dashed line between the endpoint snippet and the rest of the docs, if any.
                    writer.write_line("---")
                source_file = SourceFileFactory.create_snippet()
                source_file.add_expression(snippet)
                snippet_docstring = source_file.to_str()
                writer.write(snippet_docstring)
                writer.write_newline_if_last_line_not()

        return AST.CodeWriter(write)

    def _generate_endpoint_snippet(
        self,
        package: ir_types.Package,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        generated_root_client: GeneratedRootClient,
        snippet_writer: SnippetWriter,
        is_async: bool,
    ) -> Optional[AST.Expression]:
        if len(endpoint.examples) == 0:
            return None

        endpoint_snippet = EndpointFunctionSnippetGenerator(
            context=self._context,
            snippet_writer=snippet_writer,
            service=service,
            endpoint=endpoint,
            example=endpoint.examples[0],
        ).generate_snippet()

        def write(writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write_node(generated_root_client.async_instantiation)
            else:
                writer.write_node(generated_root_client.sync_instantiation)
            writer.write_line()

            if is_async:
                writer.write("await ")

            writer.write("client.")
            writer.write(self._get_subpackage_client_accessor(package))

            writer.write_node(endpoint_snippet)
            writer.write_newline_if_last_line_not()

        return AST.Expression(AST.CodeWriter(write))

    def _get_subpackage_client_accessor(
        self,
        package: ir_types.Package,
    ) -> str:
        components = package.fern_filepath.package_path.copy()
        if package.fern_filepath.file is not None:
            components += [package.fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.unsafe_name for component in components]) + "."

    def _named_parameters_have_docs(self, named_parameters: List[AST.NamedFunctionParameter]) -> bool:
        return named_parameters is not None and any(param.docs is not None for param in named_parameters)

    def _named_parameters_from_path_parameters(
        self, path_parameters: List[ir_types.PathParameter]
    ) -> List[AST.NamedFunctionParameter]:
        named_parameters: List[AST.NamedFunctionParameter] = []
        for path_parameter in path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                named_parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(path_parameter.name),
                        docs=path_parameter.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            path_parameter.value_type,
                            in_endpoint=True,
                        ),
                    ),
                )
        return named_parameters

    def _get_path_for_endpoint(self, endpoint: ir_types.HttpEndpoint) -> AST.Expression:
        # remove leading slash so that urljoin concatenates
        head = endpoint.full_path.head.lstrip("/")

        if len(endpoint.full_path.parts) == 0:
            return AST.Expression(f'"{head}"')

        def write(writer: AST.NodeWriter) -> None:
            writer.write('f"')
            writer.write(head)
            for i, part in enumerate(endpoint.full_path.parts):
                parameter_obj = endpoint.all_path_parameters[i]
                possible_path_part_literal = self._context.get_literal_value(parameter_obj.value_type)
                if possible_path_part_literal is not None:
                    writer.write_node(AST.Expression(f"{possible_path_part_literal}"))
                else:
                    writer.write("{")
                    writer.write_node(
                        self._context.core_utilities.jsonable_encoder(
                            AST.Expression(
                                get_parameter_name(
                                    self._get_path_parameter_from_name(
                                        endpoint=endpoint,
                                        path_parameter_name=part.path_parameter,
                                    ).name,
                                )
                            )
                        )
                    )
                    writer.write("}")
                writer.write(part.tail)
            writer.write('"')

        return AST.Expression(AST.CodeWriter(write))

    def _get_path_parameter_from_name(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        path_parameter_name: str,
    ) -> ir_types.PathParameter:
        for path_parameter in endpoint.all_path_parameters:
            if path_parameter.name.original_name == path_parameter_name:
                return path_parameter
        raise RuntimeError("Path parameter does not exist: " + path_parameter_name)

    def _get_response_body_type(self, response: ir_types.HttpResponse, is_async: bool) -> AST.TypeHint:
        return response.visit(
            file_download=lambda _: (
                AST.TypeHint.async_iterator(AST.TypeHint.bytes())
                if self._is_async
                else AST.TypeHint.iterator(AST.TypeHint.bytes())
            ),
            json=lambda json_response: self._get_json_response_body_type(json_response),
            streaming=lambda stream_response: self._get_streaming_response_body_type(
                stream_response=stream_response, is_async=is_async
            ),
            text=lambda _: AST.TypeHint.str_(),
        )

    def _get_json_response_body_type(
        self,
        json_response: ir_types.JsonResponse,
    ) -> AST.TypeHint:
        return json_response.visit(
            response=lambda response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                response.response_body_type,
            ),
            nested_property_as_response=lambda _: raise_json_nested_property_as_response_unsupported(),
        )

    def _get_streaming_response_body_type(
        self, *, stream_response: ir_types.StreamingResponse, is_async: bool
    ) -> AST.TypeHint:
        streaming_data_event_type_hint = self._get_streaming_response_data_type(stream_response)
        if is_async:
            return AST.TypeHint.async_iterator(streaming_data_event_type_hint)
        else:
            return AST.TypeHint.iterator(streaming_data_event_type_hint)

    def _get_streaming_response_data_type(self, streaming_response: ir_types.StreamingResponse) -> AST.TypeHint:
        union = streaming_response.data_event_type.get_as_union()
        if union.type == "json":
            return self._context.pydantic_generator_context.get_type_hint_for_type_reference(union.json_)
        if union.type == "text":
            return AST.TypeHint.str_()
        raise RuntimeError(f"{union.type} streaming response is unsupported")

    def _get_reference_to_query_parameter(self, query_parameter: ir_types.QueryParameter) -> AST.Expression:
        parameter_name = get_parameter_name(query_parameter.name.name)
        reference = AST.Expression(parameter_name)

        if self._is_datetime(query_parameter.value_type, allow_optional=True):
            reference = self._context.core_utilities.serialize_datetime(reference)

            is_optional = not self._is_datetime(query_parameter.value_type, allow_optional=False)
            if is_optional:
                # needed to prevent infinite recursion when writing the reference to file
                existing_reference = reference

                def write_ternary(writer: AST.NodeWriter) -> None:
                    writer.write_node(existing_reference)
                    writer.write(f" if {get_parameter_name(query_parameter.name.name)} is not None else None")

                reference = AST.Expression(AST.CodeWriter(write_ternary))

        elif self._is_date(query_parameter.value_type, allow_optional=True):
            # needed to prevent infinite recursion when writing the reference to file
            existing_reference = reference

            def write_strftime(writer: AST.NodeWriter) -> None:
                writer.write("str(")
                writer.write_node(existing_reference)
                writer.write(")")

            reference = AST.Expression(AST.CodeWriter(write_strftime))

            is_optional = not self._is_date(query_parameter.value_type, allow_optional=False)
            if is_optional:
                # needed to prevent infinite recursion when writing the reference to file
                existing_reference2 = reference

                def write_ternary(writer: AST.NodeWriter) -> None:
                    writer.write_node(existing_reference2)
                    writer.write(f" if {get_parameter_name(query_parameter.name.name)} is not None else None")

                reference = AST.Expression(AST.CodeWriter(write_ternary))

        elif not self._is_httpx_primitive_data(query_parameter.value_type, allow_optional=True):
            reference = self._context.core_utilities.jsonable_encoder(reference)

        return reference

    def _get_environment_as_str(self, *, endpoint: ir_types.HttpEndpoint) -> AST.Expression:
        if self._context.ir.environments is not None:
            environments_as_union = self._context.ir.environments.environments.get_as_union()
            if environments_as_union.type == "multipleBaseUrls":
                base_url = endpoint.base_url
                if base_url is None:
                    raise RuntimeError("Service is missing base_url")
                url_reference = get_base_url_property_name(
                    get_base_url(environments=environments_as_union, base_url_id=base_url)
                )
                return AST.Expression(
                    f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_ENVIRONMENT_METHOD_NAME}().{url_reference}"
                )
        return AST.Expression(
            f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_BASE_URL_METHOD_NAME}()"
        )

    def _get_headers_for_endpoint(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
    ) -> Optional[AST.Expression]:
        headers: List[Tuple[str, AST.Expression]] = []

        ir_headers = service.headers + endpoint.headers
        if endpoint.idempotent:
            ir_headers += idempotency_headers

        for header in ir_headers:
            literal_header_value = self._context.get_literal_header_value(header)
            if literal_header_value is not None and type(literal_header_value) is str:
                headers.append((header.name.wire_value, AST.Expression(f'"{literal_header_value}"')))
            elif literal_header_value is not None and type(literal_header_value) is bool:
                headers.append((header.name.wire_value, AST.Expression(f"{literal_header_value}")))
            else:
                headers.append((header.name.wire_value, AST.Expression(get_parameter_name(header.name.name))))

        def write_headers_dict_default(writer: AST.NodeWriter) -> None:
            writer.write("{")
            writer.write(
                f"**self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_HEADERS_METHOD_NAME}(),"
            )
            writer.write(
                f"**({EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_headers', {'{}'}) if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None else {'{}'}),"
            )
            writer.write_line("}")

        if len(headers) == 0:
            self._context.core_utilities.jsonable_encoder(
                self._context.core_utilities.remove_none_from_dict(
                    AST.Expression(AST.CodeWriter(write_headers_dict_default)),
                )
            )

        def write_headers_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            writer.write(
                f"**self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_HEADERS_METHOD_NAME}(),"
            )
            for i, (header_key, header_value) in enumerate(headers):
                writer.write(f'"{header_key}": ')
                writer.write_node(header_value)
                writer.write(", ")
            writer.write(
                f"**({EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_headers', {'{}'}) if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None else {'{}'}),"
            )
            writer.write_line("},")

        return self._context.core_utilities.jsonable_encoder(
            self._context.core_utilities.remove_none_from_dict(
                AST.Expression(AST.CodeWriter(write_headers_dict)),
            )
        )

    def _get_query_parameter_reference(self, query_parameter: ir_types.QueryParameter) -> AST.Expression:
        possible_query_literal = self._context.get_literal_value(query_parameter.value_type)
        if possible_query_literal is not None:
            return AST.Expression(f'"{possible_query_literal}"')
        return self._get_reference_to_query_parameter(query_parameter)

    def _get_query_parameters_for_endpoint(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
    ) -> Optional[AST.Expression]:
        query_parameters = [
            (query_parameter.name.wire_value, self._get_query_parameter_reference(query_parameter))
            for query_parameter in endpoint.query_parameters
        ]

        if len(query_parameters) == 0:
            return self._context.core_utilities.jsonable_encoder(
                AST.Expression(
                    f"{EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_query_parameters') if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None else None"
                )
            )

        def write_query_parameters_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for i, (query_param_key, query_param_value) in enumerate(query_parameters):
                writer.write(f'"{query_param_key}": ')
                writer.write_node(query_param_value)
                writer.write(", ")
            writer.write(
                f"**({EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE}.get('additional_query_parameters', {'{}'}) if {EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE} is not None else {'{}'}),"
            )
            writer.write_line("},")

        return self._context.core_utilities.jsonable_encoder(
            self._context.core_utilities.remove_none_from_dict(
                AST.Expression(AST.CodeWriter(write_query_parameters_dict)),
            )
        )

    def _is_datetime(
        self,
        type_reference: ir_types.TypeReference,
        *,
        allow_optional: bool,
    ) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference,
            expected=set([ir_types.PrimitiveType.DATE_TIME]),
            allow_optional=allow_optional,
            allow_enum=False,
        )

    def _is_date(
        self,
        type_reference: ir_types.TypeReference,
        *,
        allow_optional: bool,
    ) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference, expected=set([ir_types.PrimitiveType.DATE]), allow_optional=allow_optional, allow_enum=False
        )

    def _is_httpx_primitive_data(self, type_reference: ir_types.TypeReference, *, allow_optional: bool) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference, expected=HTTPX_PRIMITIVE_DATA_TYPES, allow_optional=allow_optional, allow_enum=True
        )

    def _does_type_reference_match_primitives(
        self,
        type_reference: ir_types.TypeReference,
        *,
        expected: Set[ir_types.PrimitiveType],
        allow_optional: bool,
        allow_enum: bool,
    ) -> bool:
        def visit_named_type(type_name: ir_types.DeclaredTypeName) -> bool:
            type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_id(type_name.type_id)
            return type_declaration.shape.visit(
                alias=lambda alias: self._does_type_reference_match_primitives(
                    alias.alias_of,
                    expected=expected,
                    allow_optional=allow_optional,
                    allow_enum=allow_enum,
                ),
                enum=lambda x: allow_enum,
                object=lambda x: False,
                union=lambda x: False,
                undiscriminated_union=lambda union: all(
                    self._does_type_reference_match_primitives(
                        member.type,
                        expected=expected,
                        allow_optional=allow_optional,
                        allow_enum=allow_enum,
                    )
                    for member in union.members
                ),
            )

        return type_reference.visit(
            container=lambda container: container.visit(
                list=lambda x: False,
                set=lambda x: False,
                optional=lambda item_type: allow_optional
                and self._does_type_reference_match_primitives(
                    item_type,
                    expected=expected,
                    allow_optional=True,
                    allow_enum=allow_enum,
                ),
                map=lambda x: False,
                literal=lambda literal: literal.visit(
                    boolean=lambda x: ir_types.PrimitiveType.BOOLEAN in expected,
                    string=lambda x: ir_types.PrimitiveType.STRING in expected,
                ),
            ),
            named=visit_named_type,
            primitive=lambda primitive: primitive in expected,
            unknown=lambda: False,
        )

    def _is_type_literal(self, type_reference: ir_types.TypeReference) -> bool:
        return self._context.get_literal_value(reference=type_reference) is not None

    def _is_header_literal(self, header: ir_types.HttpHeader) -> bool:
        return self._context.get_literal_header_value(header) is not None

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_typehint_for_query_param(
        self, query_parameter: ir_types.QueryParameter, query_parameter_type_hint: AST.TypeHint
    ) -> AST.TypeHint:
        value_type = query_parameter.value_type.get_as_union()
        is_optional = value_type.type == "container" and value_type.container.get_as_union().type == "optional"
        if is_optional and query_parameter.allow_multiple:
            return AST.TypeHint.optional(
                AST.TypeHint.union(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type),
                        in_endpoint=True,
                    ),
                    AST.TypeHint.sequence(
                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            unwrap_optional_type(query_parameter.value_type),
                            in_endpoint=True,
                        )
                    ),
                )
            )
        elif query_parameter.allow_multiple:
            return AST.TypeHint.union(
                query_parameter_type_hint,
                AST.TypeHint.sequence(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type),
                        in_endpoint=True,
                    )
                ),
            )
        return query_parameter_type_hint


class EndpointFunctionSnippetGenerator:
    def __init__(
        self,
        context: SdkGeneratorContext,
        snippet_writer: SnippetWriter,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        example: ir_types.ExampleEndpointCall,
    ):
        self.context = context
        self.snippet_writer = snippet_writer
        self.service = service
        self.endpoint = endpoint
        self.example = example

    def generate_snippet(self) -> AST.Expression:
        args: List[AST.Expression] = []
        all_path_parameters = (
            self.example.root_path_parameters
            + self.example.service_path_parameters
            + self.example.endpoint_path_parameters
        )
        for path_parameter in all_path_parameters:
            path_parameter_value = self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=path_parameter.value,
            )
            if not self._is_path_literal(path_parameter.name.original_name) and path_parameter_value is not None:
                args.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(path_parameter.name),
                        value=path_parameter_value,
                    ),
                )

        # TODO(amckinney): Idempotency headers aren't included in the example IR yet.
        # We need to include those examples when they're available.
        headers: Dict[str, ir_types.HttpHeader] = {}
        for header in self.service.headers + self.endpoint.headers:
            headers[header.name.wire_value] = header

        all_example_headers = self.example.service_headers + self.example.endpoint_headers
        for example_header in all_example_headers:
            if (
                example_header.name.wire_value in headers
                and self.context.get_literal_header_value(headers[example_header.name.wire_value]) is not None
            ):
                continue
            example_header_parameter_value = self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=example_header.value,
            )
            if (
                not self._is_header_literal(example_header.name.wire_value)
                and example_header_parameter_value is not None
            ):
                args.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(example_header.name.name),
                        value=example_header_parameter_value,
                    ),
                )

        for query_parameter in self.example.query_parameters:
            query_parameter_value = self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=query_parameter.value,
            )
            if not self._is_query_literal(query_parameter.name.wire_value) and query_parameter_value is not None:
                args.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(query_parameter.name.name),
                        value=query_parameter_value,
                    ),
                )

        if self.example.request is not None:
            args.extend(
                self.example.request.visit(
                    inlined_request_body=lambda inlined_request_body: self._get_snippet_for_inlined_request_body_properties(
                        example_inlined_request_body=inlined_request_body,
                    ),
                    reference=lambda reference: self._get_snippet_for_request_reference(
                        example_type_reference=reference,
                    ),
                ),
            )

        return AST.Expression(
            AST.FunctionInvocation(
                function_definition=AST.Reference(
                    qualified_name_excluding_import=(get_endpoint_name(self.endpoint),),
                ),
                args=args,
            ),
        )

    def _get_snippet_for_inlined_request_body_properties(
        self,
        example_inlined_request_body: ir_types.ExampleInlinedRequestBody,
    ) -> List[AST.Expression]:
        snippets: List[AST.Expression] = []
        for example_property in example_inlined_request_body.properties:
            property_value = self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=example_property.value,
            )
            if not self._is_inlined_request_literal(example_property.name.wire_value) and property_value is not None:
                snippets.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(example_property.name.name),
                        value=property_value,
                    ),
                )
        return snippets

    def _get_snippet_for_request_reference(
        self,
        example_type_reference: ir_types.ExampleTypeReference,
    ) -> List[AST.Expression]:
        request_value = self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=example_type_reference,
        )
        if request_value is not None:
            return [
                self.snippet_writer.get_snippet_for_named_parameter(
                    parameter_name=self._get_request_parameter_name(),
                    value=request_value,
                )
            ]
        return []

    def _get_request_parameter_name(self) -> str:
        if self.endpoint.sdk_request is None:
            raise Exception("request body is referenced but SDKRequestBody is not defined")
        return self.endpoint.sdk_request.request_parameter_name.snake_case.unsafe_name

    def _is_query_literal(self, query_parameter_wire_value: str) -> bool:
        param = next(
            filter(lambda q: q.name.wire_value == query_parameter_wire_value, self.endpoint.query_parameters), None
        )
        if param is not None:
            return self.context.get_literal_value(param.value_type) is not None
        return False

    def _is_path_literal(self, path_parameter_original_name: str) -> bool:
        param = next(
            filter(lambda p: p.name.original_name == path_parameter_original_name, self.endpoint.all_path_parameters),
            None,
        )
        if param is not None:
            return self.context.get_literal_value(param.value_type) is not None
        return False

    def _is_header_literal(self, header_wire_value: str) -> bool:
        param = next(filter(lambda h: h.name.wire_value == header_wire_value, self.endpoint.headers), None)
        if param is not None:
            return self.context.get_literal_value(param.value_type) is not None
        return False

    def _is_inlined_request_literal(self, property_wire_value: str) -> bool:
        if self.endpoint.request_body is None:
            return False
        request_body_union = self.endpoint.request_body.get_as_union()
        if request_body_union.type == "inlinedRequestBody":
            param = next(filter(lambda p: p.name.wire_value == property_wire_value, request_body_union.properties))
            if param is not None:
                return self.context.get_literal_value(param.value_type) is not None
            return False
        return False


def get_endpoint_name(endpoint: ir_types.HttpEndpoint) -> str:
    return endpoint.name.get_as_name().snake_case.unsafe_name


def get_parameter_name(name: ir_types.Name) -> str:
    return name.snake_case.safe_name


def is_endpoint_path_empty(endpoint: ir_types.HttpEndpoint) -> bool:
    return len(endpoint.full_path.head) == 0 and len(endpoint.full_path.parts) == 0


def unwrap_optional_type(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    type_as_union = type_reference.get_as_union()
    if type_as_union.type == "container":
        container_as_union = type_as_union.container.get_as_union()
        if container_as_union.type == "optional":
            return unwrap_optional_type(container_as_union.optional)
    return type_reference


def raise_json_nested_property_as_response_unsupported() -> Never:
    raise RuntimeError("nested property json response is unsupported")
