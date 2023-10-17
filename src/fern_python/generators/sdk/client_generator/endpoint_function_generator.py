from dataclasses import dataclass
from typing import List, Optional, Set, Tuple

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies import HttpX, UrlLibParse
from fern_python.generators.pydantic_model import SnippetRegistry
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext
from fern_python.generators.sdk.environment_generators.multiple_base_urls_environment_generator import (
    get_base_url,
    get_base_url_property_name,
)
from fern_python.source_file_factory import SourceFileFactory

from ..core_utilities.client_wrapper_generator import ClientWrapperGenerator
from .generated_root_client import GeneratedRootClient
from .request_body_parameters import (
    AbstractRequestBodyParameters,
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


class EndpointFunctionGenerator:
    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        serviceId: ir_types.ServiceId,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        client_wrapper_member_name: str,
        is_async: bool,
        generated_root_client: GeneratedRootClient,
        snippet_registry: SnippetRegistry,
    ):
        self._context = context
        self._package = package
        self._serviceId = serviceId
        self._service = service
        self._endpoint = endpoint
        self._is_async = is_async
        self._client_wrapper_member_name = client_wrapper_member_name
        self._generated_root_client = generated_root_client
        self._snippet_registry = snippet_registry

    def generate(self) -> GeneratedEndpointFunction:
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
                bytes=lambda _: raise_bytes_unsupported(),  # TODO: We probably just need to wrap AST.TypeHint.bytes().
            )
            if self._endpoint.request_body is not None
            else None
        )
        named_parameters = self._get_endpoint_named_parameters(
            service=self._service,
            endpoint=self._endpoint,
            request_body_parameters=request_body_parameters,
        )
        function_declaration = AST.FunctionDeclaration(
            name=self._endpoint.name.get_as_name().snake_case.unsafe_name,
            is_async=self._is_async,
            docstring=self._get_docstring_for_endpoint(
                package=self._package,
                serviceId=self._serviceId,
                endpoint=self._endpoint,
                named_parameters=named_parameters,
                path_parameters=self._endpoint.all_path_parameters,
                generated_root_client=self._generated_root_client,
                snippet_registry=self._snippet_registry,
                is_async=self._is_async,
            ),
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name=self._get_path_parameter_name(path_parameter),
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            path_parameter.value_type
                        ),
                    )
                    for path_parameter in self._endpoint.all_path_parameters
                ],
                named_parameters=named_parameters,
                return_type=self._get_response_body_type(self._endpoint.response, self._is_async)
                if self._endpoint.response is not None
                else AST.TypeHint.none(),
            ),
            body=self._create_endpoint_body_writer(
                service=self._service,
                endpoint=self._endpoint,
                request_body_parameters=request_body_parameters,
                is_async=self._is_async,
            ),
        )
        return GeneratedEndpointFunction(
            function=function_declaration,
            is_default_body_parameter_used=request_body_parameters is not None,
        )

    def _get_endpoint_named_parameters(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        request_body_parameters: Optional[AbstractRequestBodyParameters],
    ) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []

        for query_parameter in endpoint.query_parameters:
            query_parameter_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                query_parameter.value_type
            )
            parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_query_parameter_name(query_parameter),
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
                        name=self._get_header_parameter_name(header),
                        docs=header.docs,
                        type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            header.value_type
                        ),
                    ),
                )

        return parameters

    def _create_endpoint_body_writer(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        request_body_parameters: Optional[AbstractRequestBodyParameters],
        is_async: bool,
    ) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            request_pre_fetch_statements = (
                request_body_parameters.get_pre_fetch_statements() if request_body_parameters is not None else None
            )
            if request_pre_fetch_statements is not None:
                writer.write_node(AST.Expression(request_pre_fetch_statements))

            reference_to_request_body = (
                request_body_parameters.get_reference_to_request_body() if request_body_parameters is not None else None
            )

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

            writer.write_node(
                HttpX.make_request(
                    is_streaming=is_streaming,
                    is_async=is_async,
                    url=self._get_environment_as_str(endpoint=endpoint)
                    if is_endpoint_path_empty(endpoint)
                    else UrlLibParse.urljoin(
                        self._get_environment_as_str(endpoint=endpoint),
                        self._get_path_for_endpoint(endpoint),
                    ),
                    method=endpoint.method.visit(
                        get=lambda: "GET",
                        post=lambda: "POST",
                        put=lambda: "PUT",
                        patch=lambda: "PATCH",
                        delete=lambda: "DELETE",
                    ),
                    query_parameters=self._get_query_parameters_for_endpoint(endpoint=endpoint),
                    request_body=(
                        self._context.core_utilities.jsonable_encoder(reference_to_request_body)
                        if reference_to_request_body is not None
                        else None
                    ),
                    files=request_body_parameters.get_files() if request_body_parameters is not None else None,
                    response_variable_name=EndpointResponseCodeWriter.RESPONSE_VARIABLE,
                    headers=self._get_headers_for_endpoint(service=service, endpoint=endpoint),
                    auth=None,
                    timeout=AST.Expression(
                        "None"
                        if self._context.custom_config.timeout_in_seconds == "infinity"
                        else f"{self._context.custom_config.timeout_in_seconds}"
                    ),
                    response_code_writer=response_code_writer.get_writer(),
                    reference_to_client=AST.Expression(
                        f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME}"
                    ),
                )
            )

        return AST.CodeWriter(write)

    def _get_docstring_for_endpoint(
        self,
        package: ir_types.Package,
        serviceId: ir_types.ServiceId,
        endpoint: ir_types.HttpEndpoint,
        named_parameters: List[AST.NamedFunctionParameter],
        path_parameters: List[ir_types.PathParameter],
        generated_root_client: GeneratedRootClient,
        snippet_registry: SnippetRegistry,
        is_async: bool,
    ) -> Optional[AST.CodeWriter]:
        snippet = self._get_snippet_for_endpoint(
            package=package,
            serviceId=serviceId,
            endpoint=endpoint,
            generated_root_client=generated_root_client,
            snippet_registry=snippet_registry,
            is_async=is_async,
        )
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
                writer.write(snippet)
                writer.write_newline_if_last_line_not()

        return AST.CodeWriter(write)

    def _get_snippet_for_endpoint(
        self,
        package: ir_types.Package,
        serviceId: ir_types.ServiceId,
        endpoint: ir_types.HttpEndpoint,
        generated_root_client: GeneratedRootClient,
        snippet_registry: SnippetRegistry,
        is_async: bool,
    ) -> Optional[str]:
        endpoint_snippet = snippet_registry.get_snippet_for_endpoint(
            endpoint_id=endpoint.id,
        )
        if endpoint_snippet is None:
            return None

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

            if endpoint_snippet is not None:
                writer.write_node(endpoint_snippet)
            writer.write_newline_if_last_line_not()

        expr = AST.Expression(AST.CodeWriter(write))

        if is_async:
            snippet_registry.register_async_client_endpoint_snippet(
                endpoint=endpoint,
                expr=expr,
            )
        else:
            snippet_registry.register_sync_client_endpoint_snippet(
                endpoint=endpoint,
                expr=expr,
            )

        snippet = SourceFileFactory.create_snippet()
        snippet.add_expression(expr)
        return snippet.to_str()

    def _get_subpackage_client_accessor(
        self,
        package: ir_types.Package,
    ) -> str:
        if len(package.fern_filepath.package_path) == 0:
            return ""
        return ".".join([directory.snake_case.safe_name for directory in package.fern_filepath.package_path]) + "."

    def _named_parameters_have_docs(self, named_parameters: List[AST.NamedFunctionParameter]) -> bool:
        return named_parameters is not None and any(param.docs is not None for param in named_parameters)

    def _named_parameters_from_path_parameters(
        self, path_parameters: List[ir_types.PathParameter]
    ) -> List[AST.NamedFunctionParameter]:
        named_parameters: List[AST.NamedFunctionParameter] = []
        for path_parameter in path_parameters:
            named_parameters.append(
                AST.NamedFunctionParameter(
                    name=self._get_path_parameter_name(path_parameter),
                    docs=path_parameter.docs,
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        path_parameter.value_type
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
            for part in endpoint.full_path.parts:
                writer.write("{")
                writer.write(
                    self._get_path_parameter_name(
                        self._get_path_parameter_from_name(
                            endpoint=endpoint,
                            path_parameter_name=part.path_parameter,
                        ),
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
            file_download=lambda _: AST.TypeHint.async_iterator(AST.TypeHint.bytes())
            if self._is_async
            else AST.TypeHint.iterator(AST.TypeHint.bytes()),
            json=lambda json_response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                json_response.response_body_type,
            ),
            streaming=lambda stream_response: self._get_streaming_response_body_type(
                stream_response=stream_response, is_async=is_async
            ),
            text=lambda _: AST.TypeHint.str_(),
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
        reference = AST.Expression(self._get_query_parameter_name(query_parameter))

        if self._is_datetime(query_parameter.value_type, allow_optional=True):
            reference = self._context.core_utilities.serialize_datetime(reference)

            is_optional = not self._is_datetime(query_parameter.value_type, allow_optional=False)
            if is_optional:
                # needed to prevent infinite recursion when writing the reference to file
                existing_reference = reference

                def write_ternary(writer: AST.NodeWriter) -> None:
                    writer.write_node(existing_reference)
                    writer.write(f" if {self._get_query_parameter_name(query_parameter)} is not None else None")

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
                    writer.write(f" if {self._get_query_parameter_name(query_parameter)} is not None else None")

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
    ) -> Optional[AST.Expression]:
        headers: List[Tuple[str, AST.Expression]] = []

        for header in service.headers + endpoint.headers:
            literal_header_value = self._get_literal_header_value(header)
            headers.append(
                (
                    header.name.wire_value,
                    AST.Expression(
                        f'"{literal_header_value}"'
                        if literal_header_value is not None
                        else self._get_header_parameter_name(header)
                    ),
                ),
            )

        if len(headers) == 0:
            return AST.Expression(
                f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.GET_HEADERS_METHOD_NAME}()"
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

            writer.write_line("},")

        return self._context.core_utilities.remove_none_from_dict(
            AST.Expression(AST.CodeWriter(write_headers_dict)),
        )

    def _get_query_parameters_for_endpoint(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
    ) -> Optional[AST.Expression]:
        query_parameters = [
            (query_parameter.name.wire_value, self._get_reference_to_query_parameter(query_parameter))
            for query_parameter in endpoint.query_parameters
        ]

        if len(query_parameters) == 0:
            return None

        def write_query_parameters_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for i, (query_param_key, query_param_value) in enumerate(query_parameters):
                writer.write(f'"{query_param_key}": ')
                writer.write_node(query_param_value)
                writer.write(", ")

            writer.write_line("},")

        return self._context.core_utilities.remove_none_from_dict(
            AST.Expression(AST.CodeWriter(write_query_parameters_dict)),
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
            type_declaration = self._context.pydantic_generator_context.get_declaration_for_type_name(type_name)
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
                literal=lambda literal: literal.visit(string=lambda x: ir_types.PrimitiveType.STRING in expected),
            ),
            named=visit_named_type,
            primitive=lambda primitive: primitive in expected,
            unknown=lambda: False,
        )

    def _is_header_literal(self, header: ir_types.HttpHeader) -> bool:
        return self._get_literal_header_value(header) is not None

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_path_parameter_name(self, path_parameter: ir_types.PathParameter) -> str:
        return path_parameter.name.snake_case.safe_name

    def _get_header_parameter_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.safe_name

    def _get_query_parameter_name(self, query_parameter: ir_types.QueryParameter) -> str:
        return query_parameter.name.name.snake_case.safe_name

    def _get_typehint_for_query_param(
        self, query_parameter: ir_types.QueryParameter, query_parameter_type_hint: AST.TypeHint
    ) -> AST.TypeHint:
        value_type = query_parameter.value_type.get_as_union()
        is_optional = value_type.type == "container" and value_type.container.get_as_union().type == "optional"
        if is_optional and query_parameter.allow_multiple:
            return AST.TypeHint.optional(
                AST.TypeHint.union(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type)
                    ),
                    AST.TypeHint.list(
                        self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                            unwrap_optional_type(query_parameter.value_type)
                        )
                    ),
                )
            )
        elif query_parameter.allow_multiple:
            return AST.TypeHint.union(
                query_parameter_type_hint,
                AST.TypeHint.list(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        unwrap_optional_type(query_parameter.value_type)
                    )
                ),
            )
        return query_parameter_type_hint

    def _get_literal_header_value(self, header: ir_types.HttpHeader) -> Optional[str]:
        type = header.value_type.get_as_union()
        if type.type == "named":
            shape = self._context.pydantic_generator_context.get_declaration_for_type_name(type).shape.get_as_union()
            if shape.type == "alias":
                resolved_type = shape.resolved_type.get_as_union()
                if resolved_type.type == "container":
                    resolved_container_type = resolved_type.container.get_as_union()
                    if resolved_container_type.type == "literal":
                        return resolved_container_type.literal.get_as_union().string
        if type.type == "container":
            container_type = type.container.get_as_union()
            if container_type.type == "literal":
                return container_type.literal.get_as_union().string
        return None


def is_endpoint_path_empty(endpoint: ir_types.HttpEndpoint) -> bool:
    return len(endpoint.full_path.head) == 0 and len(endpoint.full_path.parts) == 0


def unwrap_optional_type(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    type_as_union = type_reference.get_as_union()
    if type_as_union.type == "container":
        container_as_union = type_as_union.container.get_as_union()
        if container_as_union.type == "optional":
            return unwrap_optional_type(container_as_union.optional)
    return type_reference


# TODO: Add support for bytes.
def raise_bytes_unsupported() -> Never:
    raise RuntimeError("bytes request is not supported")
