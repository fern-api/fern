from dataclasses import dataclass
from typing import Dict, List, Optional, Set, Tuple, Union

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST
from fern_python.codegen.ast.ast_node.node_writer import NodeWriter
from fern_python.external_dependencies import HttpX
from fern_python.external_dependencies.asyncio import Asyncio
from fern_python.generators.pydantic_model.typeddict import FernTypedDict
from fern_python.generators.sdk.client_generator.endpoint_metadata_collector import (
    EndpointMetadata,
    EndpointMetadataCollector,
    ParameterMetadata,
)
from fern_python.generators.sdk.client_generator.endpoint_response_code_writer import (
    EndpointResponseCodeWriter,
)
from fern_python.generators.sdk.client_generator.pagination.abstract_paginator import (
    PaginationSnippetConfig,
)
from fern_python.generators.sdk.client_generator.request_properties import (
    request_property_to_name,
)
from fern_python.generators.sdk.client_generator.streaming.utilities import (
    StreamingParameterType,
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
        ir_types.PrimitiveTypeV1.STRING,
        ir_types.PrimitiveTypeV1.INTEGER,
        ir_types.PrimitiveTypeV1.DOUBLE,
        ir_types.PrimitiveTypeV1.BOOLEAN,
    ]
)

ALLOWED_RESERVED_METHOD_NAMES = [
    "list",
    "set",
]


@dataclass
class GeneratedEndpointFunctionSnippet:
    example_id: str
    snippet: AST.Expression


@dataclass
class GeneratedEndpointFunction:
    function: AST.FunctionDeclaration
    is_default_body_parameter_used: bool
    snippets: List[GeneratedEndpointFunctionSnippet]


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
        endpoint_metadata_collector: Optional[EndpointMetadataCollector],
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
        self.endpoint_metadata_collector = endpoint_metadata_collector

        self.is_paginated = (
            self._endpoint.pagination is not None and self._context.generator_config.generate_paginated_clients
        )
        self.pagination = (
            self._endpoint.pagination if self._context.generator_config.generate_paginated_clients else None
        )

        self._named_parameter_names: List[str] = []
        self.request_body_parameters: Optional[AbstractRequestBodyParameters] = (
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
        self._request_parameter_name_rewrites = (
            self.request_body_parameters.get_parameter_name_rewrites()
            if self.request_body_parameters is not None
            else {}
        )

        self._named_parameters_raw, self._parameter_names_to_deconflict = self._get_endpoint_named_parameters(
            service=self._service,
            endpoint=self._endpoint,
            request_body_parameters=self.request_body_parameters,
            idempotency_headers=self._idempotency_headers,
        )

        self._path_parameter_names = dict()
        _named_parameter_names: List[str] = [param.name for param in self._named_parameters_raw]
        for path_parameter in self._endpoint.all_path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self.deconflict_parameter_name(get_parameter_name(path_parameter.name), _named_parameter_names)
                _named_parameter_names.append(name)
                self._path_parameter_names[path_parameter.name] = name

        self.is_default_body_parameter_used = self.request_body_parameters is not None
        self.collect_metadata()

    def collect_metadata(self) -> None:
        if self.endpoint_metadata_collector is None:
            return

        # Consolidate the named parameters and path parameters in a single list.
        parameters: List[AST.NamedFunctionParameter] = []
        parameters = self._named_parameters_from_path_parameters(self._endpoint.all_path_parameters)
        parameters.extend(self._named_parameters_raw)

        for param in parameters:
            self.endpoint_metadata_collector.register_endpoint_parameter(
                endpoint_id=self._endpoint.id,
                parameter=ParameterMetadata(
                    name=param.name,
                    type_reference=param.raw_type,
                    type_hint=param.type_hint,
                    description=param.docs,
                    is_required=param.type_hint is not None and param.type_hint.is_optional,
                ),
            )

        self.endpoint_metadata_collector.register_endpoint(
            endpoint_id=self._endpoint.id,
            metadata=EndpointMetadata(
                return_type=self._get_endpoint_return_type(),
                endpoint_package_path=self._get_subpackage_client_accessor(self._package),
                method_name=get_endpoint_name(self._endpoint),
            ),
        )

    def _is_overloaded_streaming_method(self) -> bool:
        return (
            self._endpoint.response is not None
            and self._endpoint.response.body is not None
            and self._endpoint.response.body.get_as_union().type == "streamParameter"
        )

    def generate(self) -> List[GeneratedEndpointFunction]:
        if self._is_overloaded_streaming_method():
            base_function = self.generate_single_function(is_overloaded=False, include_snippet=False)
            streaming_function = self.generate_single_function(is_overloaded=True, streaming_parameter="streaming")
            non_streaming_function = self.generate_single_function(
                is_overloaded=True, streaming_parameter="non-streaming"
            )
            # NOTE: the order is important here, mypy will complain if the stubs come after the actual function
            return [
                streaming_function,
                non_streaming_function,
                base_function,
            ]
        else:
            return [self.generate_single_function(is_overloaded=False)]

    def _get_overridden_parameter_types(
        self, streaming_parameter: Optional[StreamingParameterType] = None
    ) -> List[AST.NamedFunctionParameter]:
        if (
            streaming_parameter is not None
            and self._endpoint.sdk_request is not None
            and self._endpoint.sdk_request.stream_parameter is not None
        ):
            response_property = self._endpoint.sdk_request.stream_parameter
            streaming_parameter_name = request_property_to_name(response_property.property)

            cleaned_parameters = []
            for param in self._named_parameters_raw:
                if param.raw_name == streaming_parameter_name:
                    cleaned_parameters.append(
                        AST.NamedFunctionParameter(
                            name=param.name,
                            docs=param.docs,
                            type_hint=AST.TypeHint.literal(
                                AST.Expression("True" if streaming_parameter == "streaming" else "False")
                            ),
                            initializer=param.initializer,
                            raw_name=param.raw_name,
                            raw_type=param.raw_type,
                        )
                    )
                else:
                    cleaned_parameters.append(param)
            return cleaned_parameters
        return self._named_parameters_raw

    def generate_single_function(
        self,
        is_overloaded: bool,
        include_snippet: bool = True,
        streaming_parameter: Optional[StreamingParameterType] = None,
    ) -> GeneratedEndpointFunction:
        endpoint_snippets = self._generate_endpoint_snippets(
            package=self._package,
            service=self._service,
            endpoint=self._endpoint,
            generated_root_client=self._generated_root_client,
            snippet_writer=self.snippet_writer,
            is_async=self._is_async,
            streaming_parameter=streaming_parameter,
        )

        unnamed_parameters = self._get_endpoint_path_parameters()
        named_parameters = self._get_overridden_parameter_types(streaming_parameter)

        function_declaration = AST.FunctionDeclaration(
            name=get_endpoint_name(self._endpoint),
            is_async=self._is_async,
            docstring=self._get_docstring_for_endpoint(
                endpoint=self._endpoint,
                named_parameters=named_parameters,
                path_parameters=self._endpoint.all_path_parameters,
                snippet=endpoint_snippets[0].snippet
                if endpoint_snippets is not None and len(endpoint_snippets) > 0 and include_snippet
                else None,
            ),
            signature=AST.FunctionSignature(
                parameters=unnamed_parameters,
                named_parameters=named_parameters,
                return_type=self._get_endpoint_return_type(streaming_parameter=streaming_parameter),
            ),
            body=self._create_endpoint_body_writer(
                service=self._service,
                endpoint=self._endpoint,
                idempotency_headers=self._idempotency_headers,
                request_body_parameters=self.request_body_parameters,
                is_async=self._is_async,
                parameters=unnamed_parameters,
                named_parameters=named_parameters,
            )
            if not is_overloaded
            else self._create_empty_body_writer(),
            decorators=[
                AST.Expression(
                    AST.Reference(
                        qualified_name_excluding_import=("overload",),
                        import_=AST.ReferenceImport(module=AST.Module.built_in(("typing",))),
                    )
                )
            ]
            if is_overloaded
            else [],
        )
        return GeneratedEndpointFunction(
            function=function_declaration,
            is_default_body_parameter_used=self.request_body_parameters is not None,
            snippets=endpoint_snippets or [],
        )

    def _get_endpoint_return_type(self, streaming_parameter: Optional[StreamingParameterType] = None) -> AST.TypeHint:
        return_type = (
            self._get_response_body_type(self._endpoint.response.body, self._is_async, streaming_parameter)
            if self._endpoint.response is not None and self._endpoint.response.body is not None
            else AST.TypeHint.none()
        )
        return (
            return_type
            if not self.is_paginated
            else self._context.core_utilities.get_paginator_type(return_type, is_async=self._is_async)
        )

    def deconflict_parameter_name(self, name: str, used_names: List[str]) -> str:
        while name in used_names:
            name += "_"
        return name

    def _get_endpoint_path_parameters(self) -> List[AST.FunctionParameter]:
        parameters: List[AST.FunctionParameter] = []
        for path_parameter in self._endpoint.all_path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self._path_parameter_names[path_parameter.name]
                parameters.append(
                    AST.FunctionParameter(
                        name=name,
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
    ) -> Tuple[List[AST.NamedFunctionParameter], List[str]]:
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
                        initializer=self._context.pydantic_generator_context.get_initializer_for_type_reference(
                            query_parameter.value_type
                        ),
                    ),
                )

        for header in service.headers + endpoint.headers:
            if not self._is_header_literal(header):
                header_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    header.value_type,
                    in_endpoint=True,
                )
                if header.env is not None:
                    header_type_hint = AST.TypeHint.optional(header_type_hint)
                parameters.append(
                    AST.NamedFunctionParameter(
                        name=get_parameter_name(header.name.name),
                        docs=header.docs,
                        type_hint=header_type_hint,
                        initializer=AST.Expression(
                            AST.FunctionInvocation(
                                function_definition=AST.Reference(
                                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                    qualified_name_excluding_import=("getenv",),
                                ),
                                args=[AST.Expression(f'"{header.env}"')],
                            )
                        )
                        if header.env is not None
                        else None,
                    ),
                )

        parameter_names_to_deconflict: List[str] = []
        if request_body_parameters is not None:
            parameter_names_to_deconflict = [param.name for param in parameters]
            body_parameters = request_body_parameters.get_parameters(names_to_deconflict=parameter_names_to_deconflict)
            parameters.extend(body_parameters)

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
        parameters.sort(key=lambda x: x.type_hint is None or x.type_hint.is_optional)
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

        return parameters, parameter_names_to_deconflict

    def _create_empty_body_writer(self) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_line("...")

        return AST.CodeWriter(write)

    def _get_request_body(
        self, *, method: str, request_body_parameters: Optional[AbstractRequestBodyParameters], writer: AST.NodeWriter
    ) -> Optional[AST.Expression]:
        json_request_body = request_body_parameters.get_json_body() if request_body_parameters is not None else None

        def write_request_body(writer: AST.NodeWriter) -> None:
            if json_request_body is not None:
                writer.write_node(json_request_body)

        json_request_body_var = None
        if (method != "GET") and json_request_body is not None:
            if self._is_overloaded_streaming_method():
                request_json_variable_name = "_request_json"
                writer.write(f"{request_json_variable_name} = ")
                writer.write_node(AST.CodeWriter(write_request_body))
                json_request_body_var = AST.Expression(request_json_variable_name)
            else:
                json_request_body_var = AST.Expression(AST.CodeWriter(write_request_body))
        return json_request_body_var

    def _get_files(
        self, *, request_body_parameters: Optional[AbstractRequestBodyParameters], writer: AST.NodeWriter
    ) -> Optional[AST.Expression]:
        files = (
            request_body_parameters.get_files()
            if request_body_parameters is not None and request_body_parameters.get_files() is not None
            else None
        )

        if files is not None and self._is_overloaded_streaming_method():
            files_variable_name = "_request_files"
            writer.write(f"{files_variable_name} = ")
            writer.write_node(files)
            return AST.Expression(files_variable_name)
        else:
            return files

    def _create_endpoint_body_writer(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
        request_body_parameters: Optional[AbstractRequestBodyParameters],
        is_async: bool,
        named_parameters: List[AST.NamedFunctionParameter],
        parameters: List[AST.FunctionParameter],
    ) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            method = endpoint.method.visit(
                get=lambda: "GET",
                post=lambda: "POST",
                put=lambda: "PUT",
                patch=lambda: "PATCH",
                delete=lambda: "DELETE",
            )

            json_request_body_var = self._get_request_body(
                method=method, request_body_parameters=request_body_parameters, writer=writer
            )
            files = self._get_files(request_body_parameters=request_body_parameters, writer=writer)

            if self.is_paginated and self.pagination is not None:
                pagination = self.pagination.get_as_union()
                if pagination.type == "offset":
                    param = pagination.page
                    page_param_name = request_property_to_name(param.property)
                    writer.write_line(f"{page_param_name} = {page_param_name} if {page_param_name} is not None else 1")

            def get_httpx_request(
                is_streaming: bool, response_code_writer: EndpointResponseCodeWriter
            ) -> AST.Expression:
                return HttpX.make_request(
                    is_streaming=is_streaming,
                    is_async=is_async,
                    path=self._get_path_for_endpoint(endpoint=endpoint)
                    if not is_endpoint_path_empty(endpoint)
                    else None,
                    url=self._get_environment_as_str(endpoint=endpoint),
                    method=method,
                    query_parameters=self._get_query_parameters_for_endpoint(endpoint=endpoint, parent_writer=writer),
                    request_body=json_request_body_var,
                    content=request_body_parameters.get_content() if request_body_parameters is not None else None,
                    files=files,
                    response_variable_name=EndpointResponseCodeWriter.RESPONSE_VARIABLE,
                    request_options_variable_name=EndpointFunctionGenerator.REQUEST_OPTIONS_VARIABLE,
                    headers=self._get_headers_for_endpoint(
                        service=service,
                        endpoint=endpoint,
                        idempotency_headers=idempotency_headers,
                        parent_writer=writer,
                    ),
                    response_code_writer=response_code_writer.get_writer(),
                    reference_to_client=AST.Expression(
                        f"self.{self._client_wrapper_member_name}.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME}"
                    ),
                    is_default_body_parameter_used=self.is_default_body_parameter_used,
                )

            if self._endpoint.sdk_request is not None and self._endpoint.sdk_request.stream_parameter is not None:
                response_property = self._endpoint.sdk_request.stream_parameter
                streaming_parameter_name = request_property_to_name(response_property.property)

                def write_stream_generator(writer: AST.NodeWriter) -> None:
                    streaming_response_code_writer = EndpointResponseCodeWriter(
                        context=self._context,
                        errors=endpoint.errors,
                        response=endpoint.response,
                        is_async=is_async,
                        streaming_parameter="streaming",
                        pagination=self.pagination,
                        pagination_snippet_config=PaginationSnippetConfig(
                            endpoint_name=get_endpoint_name(self._endpoint),
                            parameters=parameters,
                            named_parameters=named_parameters,
                        ),
                    )
                    streaming_request = get_httpx_request(
                        is_streaming=True, response_code_writer=streaming_response_code_writer
                    )

                    writer.write_node(streaming_request)

                writer.write("if ")
                writer.write_node(AST.Expression(streaming_parameter_name))
                writer.write_line(":")
                with writer.indent():
                    stream_generator_func_name = "stream_generator"
                    writer.write_node(
                        AST.FunctionDeclaration(
                            name=stream_generator_func_name,
                            signature=AST.FunctionSignature(),
                            body=AST.CodeWriter(write_stream_generator),
                            is_async=True,
                        )
                    )
                    writer.write_newline_if_last_line_not()
                    writer.write(f"return {stream_generator_func_name}()")

                non_streaming_response_code_writer = EndpointResponseCodeWriter(
                    context=self._context,
                    errors=endpoint.errors,
                    response=endpoint.response,
                    is_async=is_async,
                    streaming_parameter="non-streaming",
                    pagination=self.pagination,
                    pagination_snippet_config=PaginationSnippetConfig(
                        endpoint_name=get_endpoint_name(self._endpoint),
                        parameters=parameters,
                        named_parameters=named_parameters,
                    ),
                )
                non_streaming_request = get_httpx_request(
                    is_streaming=False, response_code_writer=non_streaming_response_code_writer
                )
                writer.write_newline_if_last_line_not()
                writer.write_line("else:")
                with writer.indent():
                    writer.write_node(non_streaming_request)

            else:
                response_code_writer = EndpointResponseCodeWriter(
                    context=self._context,
                    errors=endpoint.errors,
                    response=endpoint.response,
                    is_async=is_async,
                    pagination=self.pagination,
                    pagination_snippet_config=PaginationSnippetConfig(
                        endpoint_name=get_endpoint_name(self._endpoint),
                        parameters=parameters,
                        named_parameters=named_parameters,
                    ),
                )
                is_streaming = (
                    True
                    if endpoint.response is not None
                    and endpoint.response.body
                    and (
                        endpoint.response.body.get_as_union().type == "streaming"
                        or endpoint.response.body.get_as_union().type == "fileDownload"
                    )
                    else False
                )
                httpx_request = get_httpx_request(is_streaming=is_streaming, response_code_writer=response_code_writer)
                writer.write_node(httpx_request)

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
                writer.write_line("Parameters")
                writer.write_line("----------")
                for i, param in enumerate(parameters):
                    if i > 0:
                        writer.write_line()
                        writer.write_line()

                    writer.write(f"{param.name} : ")
                    if param.type_hint is not None:
                        writer.write_node(param.type_hint)

                    if param.docs is not None:
                        self._write_docs(writer, param.docs)
                writer.write_line()
                writer.write_line()

            self._write_response_body_type(writer, self._endpoint.response, self._get_endpoint_return_type())

            if snippet is not None:
                writer.write_line()
                # Include a dashed line between the endpoint snippet and the rest of the docs, if any.
                writer.write_line("Examples")
                writer.write_line("--------")
                source_file = SourceFileFactory.create_snippet()
                source_file.add_expression(snippet)
                snippet_docstring = source_file.to_str()
                writer.write(snippet_docstring)
                writer.write_newline_if_last_line_not()

        return AST.CodeWriter(write)

    def _generate_endpoint_snippet_raw(self, example: ir_types.ExampleEndpointCall) -> AST.Expression:
        return EndpointFunctionSnippetGenerator(
            context=self._context,
            snippet_writer=self.snippet_writer,
            service=self._service,
            endpoint=self._endpoint,
            example=example,
            path_parameter_names=self._path_parameter_names,
            request_parameter_names=self._request_parameter_name_rewrites,
            generate_pagination=self.is_paginated == True,
        ).generate_snippet()

    def _generate_endpoint_snippets(
        self,
        package: ir_types.Package,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        generated_root_client: GeneratedRootClient,
        snippet_writer: SnippetWriter,
        is_async: bool,
        streaming_parameter: Optional[StreamingParameterType] = None,
    ) -> Optional[List[GeneratedEndpointFunctionSnippet]]:
        # Stick to user provided examples for snippets for now,
        # only use autogenerated if no user-provided examples are available, and if you're doing this, just pick the first.
        examples = [ex.example for ex in endpoint.user_specified_examples]
        if len(endpoint.user_specified_examples) == 0:
            examples = [endpoint.autogenerated_examples[0].example]
        snippets: List[GeneratedEndpointFunctionSnippet] = []
        for example in examples:
            if example is None:
                continue

            endpoint_snippet_generator = EndpointFunctionSnippetGenerator(
                context=self._context,
                snippet_writer=snippet_writer,
                service=service,
                endpoint=endpoint,
                example=example,
                path_parameter_names=self._path_parameter_names,
                request_parameter_names=self._request_parameter_name_rewrites,
                generate_pagination=self.is_paginated == True,
                streaming_parameter=streaming_parameter,
            )

            endpoint_snippet = endpoint_snippet_generator.generate_snippet()
            response_name = "response"
            endpoint_usage = endpoint_snippet_generator.generate_usage(is_async=is_async, response_name=response_name)

            # HACK: IR should provide stable ids for example
            example_id = "default"
            if example.name is not None:
                example_id = example.name.original_name
            snippets.append(
                GeneratedEndpointFunctionSnippet(
                    example_id=example_id,
                    snippet=AST.Expression(
                        self._get_snippet_writer(
                            is_async=is_async,
                            endpoint_snippet=endpoint_snippet,
                            response_name=response_name,
                            endpoint_usage=endpoint_usage,
                            generated_root_client=generated_root_client,
                            package=package,
                        )
                    ),
                )
            )

        return snippets

    def _get_snippet_writer_function_body(
        self,
        is_async: bool,
        writer: AST.NodeWriter,
        endpoint_usage: Optional[AST.Expression],
        endpoint_snippet: AST.Expression,
        response_name: str,
        package: ir_types.Package,
    ) -> None:
        if endpoint_usage is not None:
            writer.write(f"{response_name} = ")
        if is_async:
            writer.write("await ")

        writer.write("client.")
        writer.write(self._get_subpackage_client_accessor(package))

        writer.write_node(endpoint_snippet)

        if endpoint_usage is not None:
            writer.write_line()
            writer.write_node(endpoint_usage)

        writer.write_newline_if_last_line_not()

    def _get_snippet_writer(
        self,
        is_async: bool,
        endpoint_usage: Optional[AST.Expression],
        endpoint_snippet: AST.Expression,
        response_name: str,
        generated_root_client: GeneratedRootClient,
        package: ir_types.Package,
    ) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            if is_async:
                writer.write_node(generated_root_client.async_instantiation)
            else:
                writer.write_node(generated_root_client.sync_instantiation)
            writer.write_line()

            if is_async:
                writer.write_line("async def main() -> None:")
                with writer.indent():
                    self._get_snippet_writer_function_body(
                        is_async=is_async,
                        writer=writer,
                        endpoint_usage=endpoint_usage,
                        endpoint_snippet=endpoint_snippet,
                        response_name=response_name,
                        package=package,
                    )

                writer.write_node(Asyncio.run(AST.Expression("main()")), should_write_as_snippet=False)
            else:
                self._get_snippet_writer_function_body(
                    is_async=is_async,
                    writer=writer,
                    endpoint_usage=endpoint_usage,
                    endpoint_snippet=endpoint_snippet,
                    response_name=response_name,
                    package=package,
                )

        return AST.CodeWriter(write)

    def _get_subpackage_client_accessor(
        self,
        package: ir_types.Package,
    ) -> str:
        components = package.fern_filepath.package_path.copy()
        if package.fern_filepath.file is not None:
            components += [package.fern_filepath.file]
        if len(components) == 0:
            return ""
        return ".".join([component.snake_case.safe_name for component in components]) + "."

    def _named_parameters_have_docs(self, named_parameters: List[AST.NamedFunctionParameter]) -> bool:
        return named_parameters is not None and any(param.docs is not None for param in named_parameters)

    def _named_parameters_from_path_parameters(
        self, path_parameters: List[ir_types.PathParameter]
    ) -> List[AST.NamedFunctionParameter]:
        named_parameters: List[AST.NamedFunctionParameter] = []
        for path_parameter in path_parameters:
            if not self._is_type_literal(path_parameter.value_type):
                name = self._path_parameter_names[path_parameter.name]
                named_parameters.append(
                    AST.NamedFunctionParameter(
                        name=name,
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
                                self._get_path_parameter_from_name(
                                    endpoint=endpoint,
                                    path_parameter_name=part.path_parameter,
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
    ) -> str:
        for path_parameter in endpoint.all_path_parameters:
            if path_parameter.name.original_name == path_parameter_name:
                return self._path_parameter_names[path_parameter.name]
        raise RuntimeError("Path parameter does not exist: " + path_parameter_name)

    def _get_property_type_off_object(self) -> AST.TypeHint:
        return AST.TypeHint.any()

    def _unwrap_container_types(self, type_reference: ir_types.TypeReference) -> Optional[ir_types.TypeReference]:
        unwrapped_type: Union[ir_types.TypeReference, None] = type_reference
        maybe_wrapped_type: Union[ir_types.TypeReference, None] = type_reference
        if maybe_wrapped_type is not None:
            union = maybe_wrapped_type.get_as_union()
            if union.type == "container":
                unwrapped_type = union.container.visit(
                    list_=lambda item_type: item_type,
                    set_=lambda item_type: item_type,
                    optional=lambda item_type: self._unwrap_container_types(item_type),
                    map_=lambda _: None,
                    literal=lambda _: None,
                )
        return unwrapped_type

    def _get_pagination_results_type(self, fallback_typehint: AST.TypeHint) -> AST.TypeHint:
        if self.pagination is not None:
            results_response_property = self.pagination.get_as_union().results.property

            # TODO: The IR should really have the inner type baked in so we don't have to unwrap it here
            unwrapped_type: Optional[ir_types.TypeReference] = self._unwrap_container_types(
                results_response_property.value_type
            )
            if unwrapped_type is not None:
                return self._context.pydantic_generator_context.get_type_hint_for_type_reference(unwrapped_type)

        return fallback_typehint

    def _get_non_streaming_response_body_type(
        self, non_stream_response: ir_types.NonStreamHttpResponseBody, is_async: bool
    ) -> AST.TypeHint:
        return non_stream_response.visit(
            file_download=lambda _: self._get_file_download_response_body_type(is_async),
            json=lambda json_response: self._get_json_response_body_type(json_response),
            text=lambda _: AST.TypeHint.str_(),
        )

    def _get_file_download_response_body_type(self, is_async: bool) -> AST.TypeHint:
        return (
            AST.TypeHint.async_iterator(AST.TypeHint.bytes())
            if is_async
            else AST.TypeHint.iterator(AST.TypeHint.bytes())
        )

    def _get_streaming_parameter_response_body_type(
        self,
        stream_param_response: ir_types.StreamParameterResponse,
        is_async: bool,
        streaming_parameter: Optional[StreamingParameterType] = None,
    ) -> AST.TypeHint:
        stream_response = self._get_streaming_response_body_type(
            stream_response=stream_param_response.stream_response, is_async=is_async
        )
        non_stream_response = self._get_non_streaming_response_body_type(
            stream_param_response.non_stream_response, is_async=is_async
        )
        if streaming_parameter is None:
            return AST.TypeHint.union(stream_response, non_stream_response)
        else:
            return stream_response if streaming_parameter == "streaming" else non_stream_response

    def _get_response_body_type(
        self,
        response_body: ir_types.HttpResponseBody,
        is_async: bool,
        streaming_parameter: Optional[StreamingParameterType] = None,
    ) -> AST.TypeHint:
        response_type = response_body.visit(
            file_download=lambda _: self._get_file_download_response_body_type(is_async=is_async),
            json=lambda json_response: self._get_json_response_body_type(json_response),
            streaming=lambda stream_response: self._get_streaming_response_body_type(
                stream_response=stream_response, is_async=is_async
            ),
            text=lambda _: AST.TypeHint.str_(),
            stream_parameter=lambda stream_param_response: self._get_streaming_parameter_response_body_type(
                stream_param_response=stream_param_response, is_async=is_async, streaming_parameter=streaming_parameter
            ),
        )

        return response_type if not self.is_paginated else self._get_pagination_results_type(response_type)

    def _write_yielding_return(self, writer: NodeWriter, response_hint: AST.TypeHint, docs: Optional[str]) -> None:
        writer.write_line("Yields")
        writer.write_line("------")
        writer.write_node(response_hint)
        if docs is not None:
            self._write_docs(writer, docs)
        writer.write_line()

    def _write_standard_return(self, writer: NodeWriter, response_hint: AST.TypeHint, docs: Optional[str]) -> None:
        writer.write_line("Returns")
        writer.write_line("-------")
        writer.write_node(response_hint)
        if docs is not None:
            self._write_docs(writer, docs)
        writer.write_line()

    def _write_response_body_type(
        self, writer: NodeWriter, response: Optional[ir_types.HttpResponse], response_hint: AST.TypeHint
    ) -> None:
        if response is not None and response.body:
            response.body.visit(
                file_download=lambda fd: self._write_yielding_return(writer, response_hint, fd.docs),
                json=lambda json_response: self._write_standard_return(
                    writer, response_hint, json_response.get_as_union().docs
                ),
                streaming=lambda stream_response: self._write_yielding_return(
                    writer, response_hint, stream_response.get_as_union().docs
                ),
                text=lambda t: self._write_standard_return(writer, response_hint, t.docs),
                stream_parameter=lambda _: None,
            )
        else:
            writer.write_line("Returns")
            writer.write_line("-------")
            writer.write_line("None")

    def _write_docs(self, writer: NodeWriter, docs: str) -> None:
        split = docs.split("\n")
        with writer.indent():
            for i, line in enumerate(split):
                writer.write(line)
                if i < len(split) - 1:
                    writer.write_line()

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
        union = streaming_response.get_as_union()
        if union.type == "json":
            return self._context.pydantic_generator_context.get_type_hint_for_type_reference(union.payload)
        if union.type == "sse":
            return self._context.pydantic_generator_context.get_type_hint_for_type_reference(union.payload)
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

        elif self._context.custom_config.pydantic_config.use_typeddict_requests and FernTypedDict.can_tr_be_typeddict(
            query_parameter.value_type, self._context.get_types()
        ):
            # We don't need any optional wrappings for the coercion here.
            unwrapped_tr = self._context.unwrap_optional_type_reference(query_parameter.value_type)
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                unwrapped_tr, in_endpoint=True, for_typeddict=True
            )
            reference = self._context.core_utilities.convert_and_respect_annotation_metadata(
                object_=reference, annotation=type_hint
            )

        elif not self._is_httpx_primitive_data(query_parameter.value_type, allow_optional=True):
            reference = self._context.core_utilities.jsonable_encoder(reference)

        return reference

    # Only get the environment expression if the environment is multipleBaseUrls, if it's
    # not we'll leverage the URL from the client wrapper
    def _get_environment_as_str(self, *, endpoint: ir_types.HttpEndpoint) -> Optional[AST.Expression]:
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
        return None

    def _get_headers_for_endpoint(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        idempotency_headers: List[ir_types.HttpHeader],
        parent_writer: AST.NodeWriter,
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
                headers.append((header.name.wire_value, AST.Expression(f'"{str(literal_header_value).lower()}"')))
            else:
                headers.append(
                    (
                        header.name.wire_value,
                        AST.Expression(
                            f"str({get_parameter_name(header.name.name)}) if {get_parameter_name(header.name.name)} is not None else None"
                        ),
                    )
                )

        if len(headers) == 0:
            return None

        def write_headers_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for _, (header_key, header_value) in enumerate(headers):
                writer.write(f'"{header_key}": ')
                writer.write_node(header_value)
                writer.write(", ")
            writer.write_line("}")

        if self._is_overloaded_streaming_method():
            request_headers_var = "_request_headers"
            parent_writer.write(f"{request_headers_var} = ")
            parent_writer.write_node(AST.CodeWriter(write_headers_dict))

            return AST.Expression(request_headers_var)
        else:
            return AST.Expression(AST.CodeWriter(write_headers_dict))

    def _get_query_parameter_reference(self, query_parameter: ir_types.QueryParameter) -> AST.Expression:
        possible_query_literal = self._context.get_literal_value(query_parameter.value_type)
        if possible_query_literal is not None and type(possible_query_literal) is str:
            return AST.Expression(f'"{possible_query_literal}"')
        elif possible_query_literal is not None and type(possible_query_literal) is bool:
            return AST.Expression(f"{possible_query_literal}")
        return self._get_reference_to_query_parameter(query_parameter)

    def _get_query_parameters_for_endpoint(
        self, *, endpoint: ir_types.HttpEndpoint, parent_writer: AST.NodeWriter
    ) -> Optional[AST.Expression]:
        query_parameters = [
            (query_parameter.name.wire_value, self._get_query_parameter_reference(query_parameter))
            for query_parameter in endpoint.query_parameters
        ]

        if len(query_parameters) == 0:
            return None

        def write_query_parameters_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")
            for _, (query_param_key, query_param_value) in enumerate(query_parameters):
                writer.write(f'"{query_param_key}": ')
                writer.write_node(query_param_value)
                writer.write(", ")
            writer.write_line("}")

        if self._is_overloaded_streaming_method():
            request_query_params_var = "_request_query_params"
            parent_writer.write(f"{request_query_params_var} = ")
            parent_writer.write_node(AST.CodeWriter(write_query_parameters_dict))

            return AST.Expression(request_query_params_var)
        else:
            return AST.Expression(AST.CodeWriter(write_query_parameters_dict))

    def _is_datetime(
        self,
        type_reference: ir_types.TypeReference,
        *,
        allow_optional: bool,
    ) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference,
            expected=set([ir_types.PrimitiveTypeV1.DATE_TIME]),
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
            type_reference,
            expected=set([ir_types.PrimitiveTypeV1.DATE]),
            allow_optional=allow_optional,
            allow_enum=False,
        )

    def _is_httpx_primitive_data(self, type_reference: ir_types.TypeReference, *, allow_optional: bool) -> bool:
        return self._does_type_reference_match_primitives(
            type_reference, expected=HTTPX_PRIMITIVE_DATA_TYPES, allow_optional=allow_optional, allow_enum=True
        )

    def _does_type_reference_match_primitives(
        self,
        type_reference: ir_types.TypeReference,
        *,
        expected: Set[ir_types.PrimitiveTypeV1],
        allow_optional: bool,
        allow_enum: bool,
    ) -> bool:
        def visit_named_type(type_name: ir_types.NamedType) -> bool:
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
                list_=lambda x: False,
                set_=lambda x: False,
                optional=lambda item_type: allow_optional
                and self._does_type_reference_match_primitives(
                    item_type,
                    expected=expected,
                    allow_optional=True,
                    allow_enum=allow_enum,
                ),
                map_=lambda x: False,
                literal=lambda literal: literal.visit(
                    boolean=lambda x: ir_types.PrimitiveTypeV1.BOOLEAN in expected,
                    string=lambda x: ir_types.PrimitiveTypeV1.STRING in expected,
                ),
            ),
            named=visit_named_type,
            primitive=lambda primitive: primitive.v_1 in expected,
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


def _is_request_body_optional(request_body: ir_types.HttpRequestBody) -> bool:
    union = request_body.get_as_union()
    if union.type == "reference":
        return _is_type_reference_optional(union.request_body_type)
    return False


def _is_type_reference_optional(type_reference: ir_types.TypeReference) -> bool:
    union = type_reference.get_as_union()
    if union.type == "reference":
        request_body = union.request_body_type.get_as_union()
        if request_body.type == "container":
            return request_body.container.get_as_union().type == "optional"
    return False


class EndpointFunctionSnippetGenerator:
    def __init__(
        self,
        context: SdkGeneratorContext,
        snippet_writer: SnippetWriter,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
        example: ir_types.ExampleEndpointCall,
        path_parameter_names: Dict[ir_types.Name, str],
        request_parameter_names: Dict[ir_types.Name, str],
        generate_pagination: bool,
        streaming_parameter: Optional[StreamingParameterType] = None,
    ):
        self.context = context
        self.snippet_writer = snippet_writer
        self.service = service
        self.endpoint = endpoint
        self.example = example
        self.path_parameter_names = path_parameter_names
        self.request_parameter_names = request_parameter_names
        self.generate_pagination = generate_pagination
        self.streaming_parameter = streaming_parameter

    # TODO: It should be sufficient for this to just take in the example and client
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
                as_request=True,
                use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
            )
            if not self._is_path_literal(path_parameter.name.original_name):
                args.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=self.path_parameter_names[path_parameter.name],
                        # If there's no value put a None in place as path parameters are unnamed and cannot be skipped
                        value=path_parameter_value
                        if path_parameter_value is not None
                        else AST.Expression(AST.TypeHint.none()),
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
                as_request=True,
                use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
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
                as_request=True,
                use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
            )
            if not self._is_query_literal(query_parameter.name.wire_value) and query_parameter_value is not None:
                args.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(query_parameter.name.name),
                        value=query_parameter_value,
                    ),
                )

        if self.example.request is not None:
            # For some reason the example type reference is not marking it's type as optional, so we need to specify it so the
            # snippets (and thus unit tests) write correctly
            is_optional = self.endpoint.request_body is not None and _is_request_body_optional(
                request_body=self.endpoint.request_body
            )
            args.extend(
                self.example.request.visit(
                    inlined_request_body=lambda inlined_request_body: self._get_snippet_for_inlined_request_body_properties(
                        example_inlined_request_body=inlined_request_body,
                    ),
                    reference=lambda reference: self._get_snippet_for_request_reference(
                        example_type_reference=reference,
                        is_optional=is_optional,
                        request_parameter_names=self.request_parameter_names,
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

    def generate_usage(self, response_name: str, is_async: bool) -> Optional[AST.Expression]:
        is_paginated = self.endpoint.pagination and self.generate_pagination
        chunk_name = "chunk" if not is_paginated else "item"
        if (
            self.endpoint.response is not None
            and self.endpoint.response.body
            and (
                self.endpoint.response.body.get_as_union().type == "streaming"
                or is_paginated
                or self.streaming_parameter == "streaming"
            )
        ):

            def snippet_writer(writer: AST.NodeWriter) -> None:
                if is_async:
                    writer.write("async ")
                writer.write_line(f"for {chunk_name} in {response_name}:")
                with writer.indent():
                    writer.write_line(f"yield {chunk_name}")

                if is_paginated:
                    writer.write_line("# alternatively, you can paginate page-by-page")
                    if is_async:
                        writer.write("async ")
                    writer.write_line(f"for page in {response_name}.iter_pages():")
                    with writer.indent():
                        writer.write_line("yield page")

            return AST.Expression(AST.CodeWriter(snippet_writer))
        return None

    def _get_snippet_for_inlined_request_body_properties(
        self,
        example_inlined_request_body: ir_types.ExampleInlinedRequestBody,
    ) -> List[AST.Expression]:
        snippets: List[AST.Expression] = []
        for example_property in example_inlined_request_body.properties:
            property_value = self.snippet_writer.get_snippet_for_example_type_reference(
                example_type_reference=example_property.value,
                as_request=True,
                use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
            )
            if not self._is_inlined_request_literal(example_property.name.wire_value) and property_value is not None:
                snippets.append(
                    self.snippet_writer.get_snippet_for_named_parameter(
                        parameter_name=get_parameter_name(example_property.name.name),
                        value=property_value,
                    ),
                )
        return snippets

    def _get_snippet_for_request_reference_default(
        self, example_type_reference: ir_types.ExampleTypeReference
    ) -> List[AST.Expression]:
        request_value = self.snippet_writer.get_snippet_for_example_type_reference(
            example_type_reference=example_type_reference,
            as_request=True,
            use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
        )
        if request_value is not None:
            return [
                self.snippet_writer.get_snippet_for_named_parameter(
                    parameter_name=self._get_request_parameter_name(),
                    value=request_value,
                )
            ]
        return []

    def _get_snippet_for_request_reference_flattened(
        self,
        example_object: ir_types.ExampleObjectType,
        request_parameter_names: Dict[ir_types.Name, str],
    ) -> List[AST.Expression]:
        return self.snippet_writer.get_snippet_for_object_properties(
            example_object,
            request_parameter_names,
            as_request=True,
            use_typeddict_request=self.context.custom_config.pydantic_config.use_typeddict_requests,
        )

    def _get_snippet_for_request_reference(
        self,
        example_type_reference: ir_types.ExampleTypeReference,
        is_optional: bool,
        request_parameter_names: Dict[ir_types.Name, str],
    ) -> List[AST.Expression]:
        if self.context.custom_config.inline_request_params and not is_optional:
            union = example_type_reference.shape.get_as_union()
            if union.type == "named":
                shape = union.shape.get_as_union()
                if shape.type == "alias":
                    return self._get_snippet_for_request_reference(shape.value, is_optional, request_parameter_names)
                if shape.type == "object":
                    return self._get_snippet_for_request_reference_flattened(shape, request_parameter_names)
            return self._get_snippet_for_request_reference_default(example_type_reference)
        else:
            return self._get_snippet_for_request_reference_default(example_type_reference)

    def _get_request_parameter_name(self) -> str:
        if self.endpoint.sdk_request is None:
            raise Exception("request body is referenced but SDKRequestBody is not defined")
        return self.endpoint.sdk_request.request_parameter_name.snake_case.safe_name

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
            param = next(
                filter(lambda p: p.name.wire_value == property_wire_value, request_body_union.properties), None
            )
            if param is not None:
                return self.context.get_literal_value(param.value_type) is not None
            return False
        return False


def get_endpoint_name(endpoint: ir_types.HttpEndpoint) -> str:
    if endpoint.name.get_as_name().original_name.lower() in ALLOWED_RESERVED_METHOD_NAMES:
        return endpoint.name.get_as_name().snake_case.unsafe_name
    return endpoint.name.get_as_name().snake_case.safe_name


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
