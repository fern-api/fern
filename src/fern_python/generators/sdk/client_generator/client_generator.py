from dataclasses import dataclass
from typing import List, Optional, Set, Tuple

import fern.ir.resources as ir_types
from typing_extensions import Never

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import HttpX, Json, Pydantic, UrlLibParse

from ..context.sdk_generator_context import SdkGeneratorContext
from ..environment_generators import (
    MultipleBaseUrlsEnvironmentGenerator,
    SingleBaseUrlEnvironmentGenerator,
)
from .constants import DEFAULT_BODY_PARAMETER_VALUE
from .request_body_parameters import (
    AbstractRequestBodyParameters,
    FileUploadRequestBodyParameters,
    InlinedRequestBodyParameters,
    ReferencedRequestBodyParameters,
)


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    private_member_name: str
    type_hint: AST.TypeHint
    initializer: Optional[AST.Expression] = None


HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveType.STRING,
        ir_types.PrimitiveType.INTEGER,
        ir_types.PrimitiveType.DOUBLE,
        ir_types.PrimitiveType.BOOLEAN,
    ]
)


class ClientGenerator:
    ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME = "environment"
    ENVIRONMENT_MEMBER_NAME = "_environment"

    RESPONSE_VARIABLE = "_response"
    RESPONSE_JSON_VARIABLE = "_response_json"

    TOKEN_CONSTRUCTOR_PARAMETER_NAME = "token"
    TOKEN_MEMBER_NAME = "_token"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        package: ir_types.Package,
        class_name: str,
        async_class_name: str,
    ):
        self._context = context
        self._package = package
        self._class_name = class_name
        self._async_class_name = async_class_name
        self._is_default_body_parameter_used = False

    def generate(self, source_file: SourceFile) -> None:

        class_declaration = self._create_class_declaration(is_async=False)
        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))
        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=self._create_class_declaration(is_async=True),
            should_export=False,
        )

    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        class_declaration = AST.ClassDeclaration(
            name=self._async_class_name if is_async else self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=[
                        AST.NamedFunctionParameter(
                            name=param.constructor_parameter_name,
                            type_hint=param.type_hint,
                            initializer=param.initializer,
                        )
                        for param in self._get_constructor_parameters()
                    ],
                ),
                body=AST.CodeWriter(self._get_write_constructor_body(is_async=is_async)),
            ),
        )

        if self._package.service is not None:
            service = self._context.ir.services[self._package.service]
            for endpoint in service.endpoints:
                request_body_parameters: Optional[AbstractRequestBodyParameters] = (
                    endpoint.request_body.visit(
                        inlined_request_body=lambda inlined_request_body: InlinedRequestBodyParameters(
                            endpoint=endpoint,
                            request_body=inlined_request_body,
                            context=self._context,
                        ),
                        reference=lambda referenced_request_body: ReferencedRequestBodyParameters(
                            endpoint=endpoint,
                            request_body=referenced_request_body,
                            context=self._context,
                        ),
                        file_upload=lambda file_upload_request: FileUploadRequestBodyParameters(
                            endpoint=endpoint, request=file_upload_request, context=self._context
                        ),
                    )
                    if endpoint.request_body is not None
                    else None
                )

                if not self._is_default_body_parameter_used and request_body_parameters is not None:
                    self._is_default_body_parameter_used = request_body_parameters.is_default_body_parameter_used()

                class_declaration.add_method(
                    AST.FunctionDeclaration(
                        name=endpoint.name.get_as_name().snake_case.unsafe_name,
                        is_async=is_async,
                        signature=AST.FunctionSignature(
                            parameters=[
                                AST.FunctionParameter(
                                    name=self._get_path_parameter_name(path_parameter),
                                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                        path_parameter.value_type
                                    ),
                                )
                                for path_parameter in endpoint.all_path_parameters
                            ],
                            named_parameters=self._get_endpoint_named_parameters(
                                service=service,
                                endpoint=endpoint,
                                request_body_parameters=request_body_parameters,
                            ),
                            return_type=self._get_response_body_type(endpoint.response)
                            if endpoint.response is not None
                            else AST.TypeHint.none(),
                        ),
                        body=self._create_endpoint_body_writer(
                            service=service,
                            endpoint=endpoint,
                            request_body_parameters=request_body_parameters,
                            is_async=is_async,
                        ),
                    )
                )

        return class_declaration

    def _get_constructor_parameters(self) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=ClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                private_member_name=ClientGenerator.ENVIRONMENT_MEMBER_NAME,
                type_hint=AST.TypeHint(self._context.get_reference_to_environments_class())
                if self._environment_is_enum()
                else AST.TypeHint.str_(),
                initializer=AST.Expression(
                    self._context.ir.environments.environments.visit(
                        single_base_url=lambda single_base_url_environments: SingleBaseUrlEnvironmentGenerator(
                            context=self._context, environments=single_base_url_environments
                        ).get_reference_to_default_environment(),
                        multiple_base_urls=lambda multiple_base_urls_environments: MultipleBaseUrlsEnvironmentGenerator(
                            context=self._context, environments=multiple_base_urls_environments
                        ).get_reference_to_default_environment(),
                    )
                )
                if self._context.ir.environments is not None
                and self._context.ir.environments.default_environment is not None
                else None,
            )
        )

        for header in self._context.ir.headers:
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=self._get_header_constructor_parameter_name(header),
                    private_member_name=self._get_header_private_member_name(header),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        header.value_type
                    ),
                )
            )

        for header_auth_scheme in self._get_header_auth_schemes():
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=self._get_auth_scheme_header_private_member_name(header_auth_scheme),
                    private_member_name=self._get_auth_scheme_header_private_member_name(header_auth_scheme),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        header_auth_scheme.value_type
                    ),
                )
            )

        if self._has_bearer_auth():
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=ClientGenerator.TOKEN_CONSTRUCTOR_PARAMETER_NAME,
                    private_member_name=ClientGenerator.TOKEN_MEMBER_NAME,
                    type_hint=AST.TypeHint.str_()
                    if self._context.ir.sdk_config.is_auth_mandatory
                    else AST.TypeHint.optional(AST.TypeHint.str_()),
                )
            )

        if self._has_basic_auth():
            parameters.extend(
                [
                    ConstructorParameter(
                        constructor_parameter_name=self._get_username_constructor_parameter_name(),
                        private_member_name=self._get_username_member_name(),
                        type_hint=AST.TypeHint.str_()
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                    ConstructorParameter(
                        constructor_parameter_name=self._get_password_constructor_parameter_name(),
                        private_member_name=self._get_password_member_name(),
                        type_hint=AST.TypeHint.str_()
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                ]
            )

        return parameters

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            for param in self._get_constructor_parameters():
                writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
            for subpackage_id in self._package.subpackages:
                subpackage = self._context.ir.subpackages[subpackage_id]
                if subpackage.has_endpoints_in_tree:
                    writer.write_node(AST.Expression(f"self.{subpackage.name.snake_case.safe_name} = "))
                    writer.write_node(
                        AST.ClassInstantiation(
                            class_=self._context.get_reference_to_async_subpackage_service(subpackage_id)
                            if is_async
                            else self._context.get_reference_to_subpackage_service(subpackage_id),
                            kwargs=[
                                (param.constructor_parameter_name, AST.Expression(f"self.{param.private_member_name}"))
                                for param in self._get_constructor_parameters()
                            ],
                        )
                    )
                    writer.write_line()

        return _write_constructor_body

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

    def _get_path_parameter_name(self, path_parameter: ir_types.PathParameter) -> str:
        return path_parameter.name.snake_case.unsafe_name

    def _get_query_parameter_name(self, query_parameter: ir_types.QueryParameter) -> str:
        return query_parameter.name.name.snake_case.unsafe_name

    def _get_header_parameter_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_header_private_member_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_header_constructor_parameter_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_auth_scheme_header_constructor_parameter_name(self, header: ir_types.HeaderAuthScheme) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_auth_scheme_header_private_member_name(self, header: ir_types.HeaderAuthScheme) -> str:
        return header.name.name.snake_case.unsafe_name

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

            writer.write_node(
                HttpX.make_request(
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
                    query_parameters=[
                        (query_parameter.name.wire_value, self._get_reference_to_query_parameter(query_parameter))
                        for query_parameter in endpoint.query_parameters
                    ],
                    request_body=(
                        self._context.core_utilities.jsonable_encoder(reference_to_request_body)
                        if reference_to_request_body is not None
                        else None
                    ),
                    files=request_body_parameters.get_files() if request_body_parameters is not None else None,
                    response_variable_name=ClientGenerator.RESPONSE_VARIABLE,
                    headers=self._get_headers_for_endpoint(service=service, endpoint=endpoint),
                    auth=self._get_httpx_auth_for_request(),
                    timeout=AST.Expression(
                        "None"
                        if self._context.custom_config.timeout_in_seconds == "infinity"
                        else f"{self._context.custom_config.timeout_in_seconds}"
                    ),
                )
            )

            self._context.ir.error_discrimination_strategy.visit(
                status_code=lambda: self._write_status_code_discriminated_response_handler(
                    endpoint=endpoint,
                    writer=writer,
                ),
                property=lambda strategy: self._write_property_discriminated_response_handler(
                    endpoint=endpoint, writer=writer, strategy=strategy
                ),
            )

        return AST.CodeWriter(write)

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
                    reference_to_environments=AST.Expression(f"self.{ClientGenerator.ENVIRONMENT_MEMBER_NAME}"),
                    base_url_id=endpoint.base_url,
                )
        if self._environment_is_enum():
            return AST.Expression(f"self.{ClientGenerator.ENVIRONMENT_MEMBER_NAME}.value")
        else:
            return AST.Expression(f"self.{ClientGenerator.ENVIRONMENT_MEMBER_NAME}")

    def _deserialize_json_response(self, *, writer: AST.NodeWriter) -> None:
        writer.write_line(f"{ClientGenerator.RESPONSE_JSON_VARIABLE} = {ClientGenerator.RESPONSE_VARIABLE}.json()")

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
                    body=AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.text"),
                    status_code=AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.status_code"),
                )
            )
            writer.write_newline_if_last_line_not()

    def _write_status_code_discriminated_response_handler(
        self, *, endpoint: ir_types.HttpEndpoint, writer: AST.NodeWriter
    ) -> None:
        writer.write_line(f"if 200 <= {ClientGenerator.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if endpoint.response is None:
                writer.write_line("return")
            else:
                writer.write("return ")
                writer.write_node(
                    Pydantic.parse_obj_as(
                        self._get_response_body_type(endpoint.response),
                        AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.json()"),
                    )
                )
                writer.write_newline_if_last_line_not()

        for error in endpoint.errors.get_as_list():
            error_declaration = self._context.ir.errors[error.error.error_id]

            writer.write_line(f"if {ClientGenerator.RESPONSE_VARIABLE}.status_code == {error_declaration.status_code}:")
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
                                AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.json()"),
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
                body=AST.Expression(ClientGenerator.RESPONSE_JSON_VARIABLE),
                status_code=AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.status_code"),
            )
        )
        writer.write_newline_if_last_line_not()

    def _write_property_discriminated_response_handler(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        writer: AST.NodeWriter,
        strategy: ir_types.ErrorDiscriminationByPropertyStrategy,
    ) -> None:
        if endpoint.response is not None:
            self._try_deserialize_json_response(writer=writer)

        writer.write_line(f"if 200 <= {ClientGenerator.RESPONSE_VARIABLE}.status_code < 300:")
        with writer.indent():
            if endpoint.response is None:
                writer.write_line("return")
            else:
                writer.write("return ")
                writer.write_node(
                    Pydantic.parse_obj_as(
                        self._get_response_body_type(endpoint.response),
                        AST.Expression(ClientGenerator.RESPONSE_JSON_VARIABLE),
                    )
                )
                writer.write_newline_if_last_line_not()

        if endpoint.response is None:
            self._try_deserialize_json_response(writer=writer)

        if len(endpoint.errors.get_as_list()) > 0:
            writer.write_line(f'if "{strategy.discriminant.wire_value}" in {ClientGenerator.RESPONSE_JSON_VARIABLE}:')
            with writer.indent():
                for error in endpoint.errors.get_as_list():
                    error_declaration = self._context.ir.errors[error.error.error_id]

                    writer.write_line(
                        f'if {ClientGenerator.RESPONSE_JSON_VARIABLE}["{strategy.discriminant.wire_value}"] == "{error_declaration.discriminant_value.wire_value}":'
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
                                            f'{ClientGenerator.RESPONSE_JSON_VARIABLE}["{strategy.content_property.wire_value}"]'
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
                body=AST.Expression(ClientGenerator.RESPONSE_JSON_VARIABLE),
                status_code=AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.status_code"),
            )
        )
        writer.write_newline_if_last_line_not()

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

    def _get_headers_for_endpoint(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
    ) -> Optional[AST.Expression]:
        headers: List[Tuple[str, AST.Expression]] = []

        for header in self._context.ir.headers:
            headers.append(
                (
                    header.name.wire_value,
                    AST.Expression(f"self.{self._get_header_private_member_name(header)}"),
                ),
            )

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

        if self._has_bearer_auth():
            headers.append(
                (
                    "Authorization",
                    AST.Expression(
                        f'f"Bearer {{self.{ClientGenerator.TOKEN_MEMBER_NAME}}}" if self.{ClientGenerator.TOKEN_MEMBER_NAME} is not None else None'
                    ),
                )
            )

        for header_auth_scheme in self._get_header_auth_schemes():
            headers.append(
                (
                    header_auth_scheme.name.wire_value,
                    AST.Expression(
                        f"self.{self._get_auth_scheme_header_private_member_name(header_auth_scheme)}"
                        if header_auth_scheme.prefix is None
                        else 'f"'
                        + f"{header_auth_scheme.prefix} {{self.{self._get_auth_scheme_header_private_member_name(header_auth_scheme)}}}"
                        + '"'
                    ),
                ),
            )

        if len(headers) == 0:
            return None

        def write_headers_dict(writer: AST.NodeWriter) -> None:
            writer.write("{")

            for i, (header_key, header_value) in enumerate(headers):
                writer.write(f'"{header_key}": ')
                writer.write_node(header_value)
                writer.write(", ")

            writer.write_line("},")

        return self._context.core_utilities.remove_none_from_headers(
            AST.Expression(AST.CodeWriter(write_headers_dict)),
        )

    def _has_bearer_auth(self) -> bool:
        for scheme in self._context.ir.auth.schemes:
            if scheme.get_as_union().type == "bearer":
                return True
        return False

    def _has_basic_auth(self) -> bool:
        return self._get_basic_auth_scheme() is not None

    def _get_basic_auth_scheme(self) -> Optional[ir_types.BasicAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "basic":
                return scheme_as_union
        return None

    def _get_basic_auth_scheme_or_raise(self) -> ir_types.BasicAuthScheme:
        scheme = self._get_basic_auth_scheme()
        if scheme is None:
            raise RuntimeError("No basic auth scheme exists")
        return scheme

    def _get_header_auth_schemes(self) -> List[ir_types.HeaderAuthScheme]:
        header_auth_schemes: List[ir_types.HeaderAuthScheme] = []
        for scheme in self._context.ir.auth.schemes:
            scheme_member = scheme.get_as_union()
            if scheme_member.type == "header":
                header_auth_schemes.append(scheme_member)
        return header_auth_schemes

    def _get_httpx_auth_for_request(self) -> Optional[AST.Expression]:
        if not self._has_basic_auth():
            return None
        return AST.Expression(
            f"(self.{self._get_username_member_name()}, self.{self._get_password_member_name()}) if self.{self._get_username_member_name()} is not None and self.{self._get_password_member_name()} is not None else None"
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

    def _write_default_param(self, writer: AST.NodeWriter) -> None:
        writer.write_line("# this is used as the default value for optional parameters")
        writer.write(f"{DEFAULT_BODY_PARAMETER_VALUE} = ")
        writer.write_node(AST.TypeHint.cast(AST.TypeHint.any(), AST.Expression("...")))
        writer.write_newline_if_last_line_not()

    def _get_response_body_type(self, response: ir_types.HttpResponse) -> AST.TypeHint:
        return response.visit(
            file_download=raise_file_download_unsupported,
            json=lambda json_response: self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                json_response.response_body_type
            ),
        )

    def _is_header_literal(self, header: ir_types.HttpHeader) -> bool:
        return self._get_literal_header_value(header) is not None

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

    def _get_username_constructor_parameter_name(self) -> str:
        return self._get_basic_auth_scheme_or_raise().username.snake_case.unsafe_name

    def _get_username_member_name(self) -> str:
        return f"_{self._get_username_constructor_parameter_name()}"

    def _get_password_constructor_parameter_name(self) -> str:
        return self._get_basic_auth_scheme_or_raise().password.snake_case.unsafe_name

    def _get_password_member_name(self) -> str:
        return f"_{self._get_password_constructor_parameter_name()}"


def is_endpoint_path_empty(endpoint: ir_types.HttpEndpoint) -> bool:
    return len(endpoint.full_path.head) == 0 and len(endpoint.full_path.parts) == 0


def unwrap_optional_type(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    type_as_union = type_reference.get_as_union()
    if type_as_union.type == "container":
        container_as_union = type_as_union.container.get_as_union()
        if container_as_union.type == "optional":
            return unwrap_optional_type(container_as_union.optional)
    return type_reference


def raise_file_download_unsupported(file_download_response: ir_types.FileDownloadResponse) -> Never:
    raise RuntimeError("File download is not supported")
