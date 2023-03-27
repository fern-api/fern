from dataclasses import dataclass
from typing import List, Optional, Tuple

import fern.ir.pydantic as ir_types
from typing_extensions import Never

from fern_python.codegen import AST, SourceFile
from fern_python.external_dependencies import Backports, HttpX, Pydantic, UrlLib

from ..context.sdk_generator_context import SdkGeneratorContext
from .request_body_parameters import (
    AbstractRequestBodyParameters,
    InlinedRequestBodyParameters,
    ReferencedRequestBodyParameters,
)


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    private_member_name: str
    type_hint: AST.TypeHint


class ClientGenerator:
    ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME = "environment"
    ENVIRONMENT_MEMBER_NAME = "_environment"

    RESPONSE_VARIABLE = "_response"
    RESPONSE_JSON_VARIABLE = "_response_json"

    TOKEN_CONSTRUCTOR_PARAMETER_NAME = "token"
    TOKEN_MEMBER_NAME = "_token"

    USERNAME_CONSTRUCTOR_PARAMETER_NAME = "username"
    USERNAME_MEMBER_NAME = "_username"

    PASSWORD_CONSTRUCTOR_PARAMETER_NAME = "password"
    PASSWORD_MEMBER_NAME = "_password"

    def __init__(self, context: SdkGeneratorContext, package: ir_types.Package, class_name: str):
        self._context = context
        self._package = package
        self._class_name = class_name

    def generate(self, source_file: SourceFile) -> None:
        class_declaration = AST.ClassDeclaration(
            name=self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=[
                        AST.NamedFunctionParameter(name=param.constructor_parameter_name, type_hint=param.type_hint)
                        for param in self._get_constructor_parameters()
                    ],
                ),
                body=AST.CodeWriter(self._write_constructor_body),
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
                        file_upload=raise_file_upload_not_supported,
                    )
                    if endpoint.request_body is not None
                    else None
                )
                class_declaration.add_method(
                    AST.FunctionDeclaration(
                        name=endpoint.name.get_as_name().snake_case.unsafe_name,
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
                            named_parameters=self._get_endpoint_named_parameters(service=service, endpoint=endpoint),
                            return_type=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                endpoint.response.response_body_type
                            )
                            if endpoint.response is not None
                            else AST.TypeHint.none(),
                        ),
                        body=self._create_endpoint_body_writer(
                            service=service,
                            endpoint=endpoint,
                            request_body_parameters=request_body_parameters,
                        ),
                    )
                )

        for subpackage_id in self._package.subpackages:
            subpackage = self._context.ir.subpackages[subpackage_id]
            if subpackage.has_endpoints_in_tree:
                class_declaration.add_method(
                    AST.FunctionDeclaration(
                        name=subpackage.name.snake_case.unsafe_name,
                        signature=AST.FunctionSignature(
                            return_type=AST.TypeHint(self._context.get_reference_to_subpackage_service(subpackage_id))
                        ),
                        body=self._write_subpackage_getter(subpackage_id),
                        decorators=[Backports.cached_property()],
                    )
                )

        source_file.add_class_declaration(
            declaration=class_declaration,
            should_export=False,
        )

    def _get_constructor_parameters(self) -> List[ConstructorParameter]:
        parameters: List[ConstructorParameter] = []

        parameters.append(
            ConstructorParameter(
                constructor_parameter_name=ClientGenerator.ENVIRONMENT_CONSTRUCTOR_PARAMETER_NAME,
                private_member_name=ClientGenerator.ENVIRONMENT_MEMBER_NAME,
                type_hint=AST.TypeHint(self._context.get_reference_to_environments_enum())
                if self._context.ir.environments is not None
                else AST.TypeHint.str_(),
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
                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                )
            )

        if self._has_basic_auth():
            parameters.extend(
                [
                    ConstructorParameter(
                        constructor_parameter_name=ClientGenerator.USERNAME_CONSTRUCTOR_PARAMETER_NAME,
                        private_member_name=ClientGenerator.USERNAME_MEMBER_NAME,
                        type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                    ConstructorParameter(
                        constructor_parameter_name=ClientGenerator.PASSWORD_CONSTRUCTOR_PARAMETER_NAME,
                        private_member_name=ClientGenerator.PASSWORD_MEMBER_NAME,
                        type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                ]
            )

        return parameters

    def _write_constructor_body(self, writer: AST.NodeWriter) -> None:
        for param in self._get_constructor_parameters():
            writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")

    def _get_endpoint_named_parameters(
        self,
        *,
        service: ir_types.HttpService,
        endpoint: ir_types.HttpEndpoint,
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

        if endpoint.request_body is not None:
            parameters.extend(
                endpoint.request_body.visit(
                    inlined_request_body=self._get_parameters_for_inlined_request_body,
                    reference=lambda reference: self._get_parameters_for_referenced_request_body(
                        endpoint=endpoint,
                        referenced_request_body=reference,
                    ),
                    file_upload=raise_file_upload_not_supported,
                )
            )

        for header in service.headers + endpoint.headers:
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
    ) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            writer.write_node(
                HttpX.make_request(
                    url=AST.Expression(f"self.{ClientGenerator.ENVIRONMENT_MEMBER_NAME}")
                    if is_endpoint_path_empty(endpoint)
                    else UrlLib.urljoin(
                        AST.Expression(f"self.{ClientGenerator.ENVIRONMENT_MEMBER_NAME}"),
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
                        (
                            query_parameter.name.wire_value,
                            AST.Expression(self._get_query_parameter_name(query_parameter)),
                        )
                        for query_parameter in endpoint.query_parameters
                    ],
                    request_body=(
                        self._context.core_utilities.jsonable_encoder(
                            request_body_parameters.get_reference_to_request_body()
                        )
                        if request_body_parameters is not None
                        else None
                    ),
                    response_variable_name=ClientGenerator.RESPONSE_VARIABLE,
                    headers=self._get_headers_for_endpoint(service=service, endpoint=endpoint),
                    auth=self._get_httpx_auth_for_request(),
                )
            )

            writer.write_line(f"{ClientGenerator.RESPONSE_JSON_VARIABLE} = {ClientGenerator.RESPONSE_VARIABLE}.json()")

            if endpoint.response is not None:
                writer.write_line(f"if 200 <= {ClientGenerator.RESPONSE_VARIABLE}.status_code < 300:")
                with writer.indent():
                    writer.write("return ")
                    writer.write_node(
                        Pydantic.parse_obj_as(
                            self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                                endpoint.response.response_body_type
                            ),
                            AST.Expression(ClientGenerator.RESPONSE_VARIABLE),
                        )
                    )
                    writer.write_newline_if_last_line_not()

            self._context.ir.error_discrimination_strategy.visit(
                status_code=lambda: self._write_error_handlers(endpoint=endpoint, writer=writer),
                property=lambda strategy: self._write_property_discriminated_error_handlers(
                    endpoint=endpoint, writer=writer, strategy=strategy
                ),
            )

            writer.write("raise ")
            writer.write_node(
                self._context.core_utilities.instantiate_api_error(
                    body=AST.Expression(f"{ClientGenerator.RESPONSE_JSON_VARIABLE}"),
                    status_code=AST.Expression(f"{ClientGenerator.RESPONSE_VARIABLE}.status_code"),
                )
            )

        return AST.CodeWriter(write)

    def _write_error_handlers(self, *, endpoint: ir_types.HttpEndpoint, writer: AST.NodeWriter) -> None:
        for error in endpoint.errors.get_as_list():
            writer.write_line("if " + self._get_condition_for_error(error.error) + ":")
            with writer.indent():
                writer.write("raise ")
                writer.write_node(
                    AST.ClassInstantiation(
                        class_=self._context.get_reference_to_error(error.error),
                        args=self._get_reference_to_error_body(error.error),
                    )
                )
                writer.write_newline_if_last_line_not()

    def _write_property_discriminated_error_handlers(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        writer: AST.NodeWriter,
        strategy: ir_types.ErrorDiscriminationByPropertyStrategy,
    ) -> None:
        if len(endpoint.errors.get_as_list()) == 0:
            return
        writer.write_line(f'if "{strategy.discriminant.wire_value}" in {ClientGenerator.RESPONSE_JSON_VARIABLE}:')
        with writer.indent():
            self._write_error_handlers(endpoint=endpoint, writer=writer)

    def _get_condition_for_error(self, error: ir_types.DeclaredErrorName) -> str:
        error_declaration = self._context.ir.errors[error.error_id]

        return self._context.ir.error_discrimination_strategy.visit(
            status_code=lambda: f"{ClientGenerator.RESPONSE_VARIABLE}.status_code == {error_declaration.status_code}",
            property=lambda strategy: f'{ClientGenerator.RESPONSE_JSON_VARIABLE}["{strategy.discriminant.wire_value}"] == "{error_declaration.discriminant_value.wire_value}"',  # noqa: E501
        )

    def _get_reference_to_error_body(self, error: ir_types.DeclaredErrorName) -> List[AST.Expression]:
        error_declaration = self._context.ir.errors[error.error_id]
        if error_declaration.type is None:
            return []
        error_body_type = error_declaration.type

        return self._context.ir.error_discrimination_strategy.visit(
            status_code=lambda: [
                Pydantic.parse_obj_as(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(error_body_type),
                    AST.Expression(ClientGenerator.RESPONSE_JSON_VARIABLE),
                )
            ],
            property=lambda strategy: [
                Pydantic.parse_obj_as(
                    self._context.pydantic_generator_context.get_type_hint_for_type_reference(error_body_type),
                    AST.Expression(f"{ClientGenerator.RESPONSE_JSON_VARIABLE}[{strategy.content_property.wire_value}]"),
                )
            ],
        )

    def _get_parameters_for_inlined_request_body(
        self, inlined_request_body: ir_types.InlinedRequestBody
    ) -> List[AST.NamedFunctionParameter]:
        parameters: List[AST.NamedFunctionParameter] = []
        for property in self._get_all_properties_for_inlined_request_body(inlined_request_body):
            parameters.append(
                AST.NamedFunctionParameter(
                    name=property.name.name.snake_case.unsafe_name,
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        property.value_type
                    ),
                ),
            )
        return parameters

    def _get_all_properties_for_inlined_request_body(
        self, inlined_request_body: ir_types.InlinedRequestBody
    ) -> List[ir_types.InlinedRequestBodyProperty]:
        properties = inlined_request_body.properties.copy()
        for extension in inlined_request_body.extends:
            properties.extend(
                [
                    ir_types.InlinedRequestBodyProperty(
                        name=extended_property.name,
                        value_type=extended_property.value_type,
                        docs=extended_property.docs,
                    )
                    for extended_property in (
                        self._context.pydantic_generator_context.get_all_properties_including_extensions(extension)
                    )
                ]
            )
        return properties

    def _get_parameters_for_referenced_request_body(
        self,
        *,
        endpoint: ir_types.HttpEndpoint,
        referenced_request_body: ir_types.HttpRequestBodyReference,
    ) -> List[AST.NamedFunctionParameter]:
        if endpoint.sdk_request is None:
            raise RuntimeError("Request body is referenced by SDKRequestBody is not defined")
        return [
            AST.NamedFunctionParameter(
                name=endpoint.sdk_request.request_parameter_name.snake_case.unsafe_name,
                type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                    referenced_request_body.request_body_type
                ),
            )
        ]

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
            headers.append(
                (
                    header.name.wire_value,
                    AST.Expression(self._get_header_parameter_name(header)),
                ),
            )

        if self._has_bearer_auth():
            headers.append(
                (
                    "Authorization",
                    AST.Expression(
                        f'f"Bearer {{self.{ClientGenerator.TOKEN_MEMBER_NAME}}}" if self.{ClientGenerator.TOKEN_MEMBER_NAME} is not None else None'  # noqa: E501
                    ),
                )
            )

        for header_auth_scheme in self._get_header_auth_schemes():
            headers.append(
                (
                    header.name.wire_value,
                    AST.Expression(f"self.{self._get_auth_scheme_header_private_member_name(header_auth_scheme)}"),
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
        for scheme in self._context.ir.auth.schemes:
            if scheme.get_as_union().type == "basic":
                return True
        return False

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
            f"(self.{ClientGenerator.USERNAME_MEMBER_NAME}, self.{ClientGenerator.PASSWORD_MEMBER_NAME})"
        )

    def _write_subpackage_getter(self, subpackage_id: ir_types.SubpackageId) -> AST.CodeWriter:
        def write(writer: AST.NodeWriter) -> None:
            writer.write("return ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=self._context.get_reference_to_subpackage_service(subpackage_id),
                    kwargs=[
                        (param.constructor_parameter_name, AST.Expression(f"self.{param.private_member_name}"))
                        for param in self._get_constructor_parameters()
                    ],
                )
            )
            writer.write_line()

        return AST.CodeWriter(write)


def raise_file_upload_not_supported(request: ir_types.FileUploadRequest) -> Never:
    raise RuntimeError("File upload is not supported")


def is_endpoint_path_empty(endpoint: ir_types.HttpEndpoint) -> bool:
    return len(endpoint.full_path.head) == 0 and len(endpoint.full_path.parts) == 0


def unwrap_optional_type(type_reference: ir_types.TypeReference) -> ir_types.TypeReference:
    type_as_union = type_reference.get_as_union()
    if type_as_union.type == "container":
        container_as_union = type_as_union.container.get_as_union()
        if container_as_union.type == "optional":
            return unwrap_optional_type(container_as_union.optional)
    return type_reference
