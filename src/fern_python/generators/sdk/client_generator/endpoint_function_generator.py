from dataclasses import dataclass
from typing import List, Optional, Set, Tuple

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.external_dependencies import HttpX, UrlLibParse
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.generators.sdk.context.sdk_generator_context import SdkGeneratorContext

from ..core_utilities.client_wrapper_generator import ClientWrapperGenerator
from ..environment_generators import MultipleBaseUrlsEnvironmentGenerator
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
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        client_wrapper_member_name: str,
        environment_member_name: str,
        is_async: bool,
    ):
        self._context = context
        self._service = service
        self._endpoint = endpoint
        self._is_async = is_async
        self._client_wrapper_member_name = client_wrapper_member_name
        self._environment_member_name = environment_member_name

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
            )
            if self._endpoint.request_body is not None
            else None
        )

        function_declaration = AST.FunctionDeclaration(
            name=self._endpoint.name.get_as_name().snake_case.unsafe_name,
            is_async=self._is_async,
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
                named_parameters=self._get_endpoint_named_parameters(
                    service=self._service,
                    endpoint=self._endpoint,
                    request_body_parameters=request_body_parameters,
                ),
                return_type=self._get_response_body_type(self._endpoint.sdk_response, self._is_async)
                if self._endpoint.sdk_response is not None
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
                    type_hint=AST.TypeHint.union(
                        query_parameter_type_hint,
                        AST.TypeHint.list(
                            self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                unwrap_optional_type(query_parameter.value_type)
                            )
                        ),
                    )
                    if query_parameter.allow_multiple
                    else query_parameter_type_hint,
                ),
            )

        if request_body_parameters is not None:
            parameters.extend(request_body_parameters.get_parameters())

        for header in service.headers + endpoint.headers:
            if not self._is_header_literal(header):
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=self._get_header_parameter_name(header),
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
                if endpoint.sdk_response is not None
                and (
                    endpoint.sdk_response.get_as_union().type == "streaming"
                    or endpoint.sdk_response.get_as_union().type == "fileDownload"
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

    def _get_response_body_type(self, sdk_response: ir_types.SdkResponse, is_async: bool) -> AST.TypeHint:
        return sdk_response.visit(
            maybe_streaming=raise_maybe_streaming_unsupported,
            file_download=lambda _: AST.TypeHint.async_iterator(AST.TypeHint.bytes())
            if self._is_async
            else AST.TypeHint.iterator(AST.TypeHint.bytes()),
            json=lambda json_response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                json_response.response_body_type
            ),
            streaming=lambda stream_response: self._get_streaming_response_body_type(
                stream_response=stream_response, is_async=is_async
            ),
        )

    def _get_streaming_response_body_type(
        self, *, stream_response: ir_types.StreamingResponse, is_async: bool
    ) -> AST.TypeHint:
        streaming_data_event_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
            stream_response.data_event_type
        )
        if is_async:
            return AST.TypeHint.async_iterator(streaming_data_event_type_hint)
        else:
            return AST.TypeHint.iterator(streaming_data_event_type_hint)

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
                if endpoint.base_url is None:
                    raise RuntimeError("Service is missing base_url")
                return MultipleBaseUrlsEnvironmentGenerator(
                    context=self._context, environments=environments_as_union
                ).get_reference_to_base_url(
                    reference_to_environments=AST.Expression(f"self.{self._environment_member_name}"),
                    base_url_id=endpoint.base_url,
                )
        if self._environment_is_enum():
            return AST.Expression(f"self.{self._environment_member_name}.value")
        else:
            return AST.Expression(f"self.{self._environment_member_name}")

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


def raise_maybe_streaming_unsupported(maybe_streaming_response: ir_types.MaybeStreamingResponse) -> Never:
    raise RuntimeError("Maybe streaming is not supported")
