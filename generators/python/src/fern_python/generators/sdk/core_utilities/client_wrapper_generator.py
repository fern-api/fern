import typing
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional

import fern.ir.resources as ir_types
from ..context.sdk_generator_context import SdkGeneratorContext
from ..environment_generators import GeneratedEnvironment
from fdr import PayloadInput, Template, TemplateInput

import fern_python.generators.sdk.names as names
from fern_python.codegen import AST, Project, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import httpx
from fern_python.generators.sdk.client_generator.base_client_generator import (
    ConstructorParameter as BaseClientGeneratorConstructorParameter,
)
from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities
from fern_python.snippet.template_utils import TemplateGenerator


@dataclass
class ConstructorParameter(BaseClientGeneratorConstructorParameter):
    getter_method: typing.Optional[AST.FunctionDeclaration] = None
    header_key: typing.Optional[str] = None
    header_prefix: typing.Optional[str] = None
    environment_variable: typing.Optional[str] = None
    is_basic: bool = False
    docs: typing.Optional[str] = None
    template: typing.Optional[Template] = None


@dataclass
class LiteralHeader:
    constructor_parameter_name: str
    private_member_name: str
    header: ir_types.HttpHeader
    header_key: typing.Optional[str] = None


@dataclass
class ConstructorInfo:
    constructor_parameters: List[ConstructorParameter]
    literal_headers: List[LiteralHeader]


@dataclass
class UrlStorageInfo:
    member: ConstructorParameter
    getter: AST.FunctionDeclaration


class ClientWrapperGenerator:
    AUTHORIZATION_HEADER = "Authorization"
    BEARER_AUTH_PREFIX = "Bearer"

    BASE_CLIENT_WRAPPER_CLASS_NAME = "BaseClientWrapper"

    GET_HEADERS_METHOD_NAME = "get_headers"
    GET_BASE_URL_METHOD_NAME = "get_base_url"
    GET_TIMEOUT_METHOD_NAME = "get_timeout"
    GET_ENVIRONMENT_METHOD_NAME = "get_environment"

    BASE_URL_PARAMETER_NAME = "base_url"
    ENVIRONMENT_PARAMETER_NAME = "environment"

    TIMEOUT_PARAMETER_NAME = "timeout"

    HTTPX_CLIENT_MEMBER_NAME = "httpx_client"

    STRING_OR_SUPPLIER_TYPE_HINT = AST.TypeHint.union(
        AST.TypeHint.str_(), AST.TypeHint.callable(parameters=[], return_type=AST.TypeHint.str_())
    )

    HEADERS_CONSTRUCTOR_PARAMETER_NAME = "headers"
    HEADERS_CONSTRUCTOR_PARAMETER_DOCS = "Additional headers to send with every request."
    HEADERS_MEMBER_NAME = "_headers"
    GET_CUSTOM_HEADERS_METHOD_NAME = "get_custom_headers"

    def __init__(
        self,
        *,
        context: SdkGeneratorContext,
        generated_environment: Optional[GeneratedEnvironment],
    ):
        self._context = context
        self._generated_environment = generated_environment

    def generate(self, source_file: SourceFile, project: Project) -> None:
        constructor_info = self._get_constructor_info()
        url_constructor_param = self._get_url_storage_info()
        timeout_param = self._get_timeout_constructor_parameter()
        constructor_parameters = [param for param in constructor_info.constructor_parameters]
        constructor_parameters.append(url_constructor_param)
        constructor_parameters.append(timeout_param)

        source_file.add_class_declaration(
            declaration=self._create_base_client_wrapper_class_declaration(
                constructor_parameters=constructor_parameters,
                literal_headers=constructor_info.literal_headers,
                project=project,
            ),
            should_export=True,
        )
        source_file.add_class_declaration(
            declaration=self._create_sync_client_wrapper_class_declaration(
                constructor_parameters=constructor_parameters,
                literal_headers=constructor_info.literal_headers,
            ),
            should_export=True,
        )
        source_file.add_class_declaration(
            declaration=self._create_async_client_wrapper_class_declaration(
                constructor_parameters=constructor_parameters,
                literal_headers=constructor_info.literal_headers,
            ),
            should_export=True,
        )

    def _get_url_storage_info(self) -> ConstructorParameter:
        url_storage_type = get_client_wrapper_url_type(ir=self._context.ir)
        if url_storage_type is ClientWrapperUrlStorage.URL:
            return self._get_base_url_constructor_parameter()
        elif url_storage_type is ClientWrapperUrlStorage.ENVIRONMENT:
            return self._get_environment_constructor_parameter()
        else:
            raise Exception(f"URL Storage type is unknown {url_storage_type}")

    def _get_base_url_constructor_parameter(self) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.BASE_URL_PARAMETER_NAME,
            type_hint=AST.TypeHint.str_(),
            private_member_name=f"_{ClientWrapperGenerator.BASE_URL_PARAMETER_NAME}",
            initializer=AST.Expression(
                f'{ClientWrapperGenerator.BASE_URL_PARAMETER_NAME}="https://yourhost.com/path/to/api"',
            ),
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_BASE_URL_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.str_()),
                body=AST.CodeWriter(f"return self._{ClientWrapperGenerator.BASE_URL_PARAMETER_NAME}"),
            ),
        )

    def _get_timeout_constructor_parameter(self) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.TIMEOUT_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(AST.TypeHint.float_()),
            private_member_name=f"_{ClientWrapperGenerator.TIMEOUT_PARAMETER_NAME}",
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_TIMEOUT_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.optional(AST.TypeHint.float_())),
                body=AST.CodeWriter(f"return self._{ClientWrapperGenerator.TIMEOUT_PARAMETER_NAME}"),
            ),
        )

    def _get_environment_constructor_parameter(self) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME,
            type_hint=AST.TypeHint(self._context.get_reference_to_environments_class()),
            private_member_name=f"_{ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME}",
            initializer=self._get_environment_instantiation(
                self._generated_environment,
            ),
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_ENVIRONMENT_METHOD_NAME,
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint(self._context.get_reference_to_environments_class())
                ),
                body=AST.CodeWriter(f"return self._{ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME}"),
            ),
        )

    def _create_base_client_wrapper_class_declaration(
        self,
        *,
        constructor_parameters: typing.List[ConstructorParameter],
        literal_headers: typing.List[LiteralHeader],
        project: Project,
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(
            constructor_parameters=constructor_parameters,
            literal_headers=literal_headers,
        )

        class_declaration = AST.ClassDeclaration(
            name=ClientWrapperGenerator.BASE_CLIENT_WRAPPER_CLASS_NAME,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_constructor_body(
                        constructor_parameters=constructor_parameters,
                        literal_headers=literal_headers,
                    )
                ),
            ),
        )

        class_declaration.add_method(
            AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_HEADERS_METHOD_NAME,
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())
                ),
                body=AST.CodeWriter(
                    self._get_write_get_headers_body(
                        constructor_parameters=constructor_parameters,
                        literal_headers=literal_headers,
                        project=project,
                    )
                ),
            )
        )

        for constructor_param in constructor_parameters:
            if constructor_param.getter_method is not None:
                class_declaration.add_method(constructor_param.getter_method)

        return class_declaration

    def _create_sync_client_wrapper_class_declaration(
        self, *, constructor_parameters: typing.List[ConstructorParameter], literal_headers: typing.List[LiteralHeader]
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(
            constructor_parameters=constructor_parameters,
            literal_headers=literal_headers,
        )

        named_parameters.append(
            AST.NamedFunctionParameter(
                name=ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME,
                type_hint=AST.TypeHint(httpx.HttpX.CLIENT),
            )
        )

        class_declaration = AST.ClassDeclaration(
            name=CoreUtilities.SYNC_CLIENT_WRAPPER_CLASS_NAME,
            extends=[AST.ClassReference((ClientWrapperGenerator.BASE_CLIENT_WRAPPER_CLASS_NAME,))],
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_derived_client_wrapper_constructor_body(
                        constructor_parameters=constructor_parameters,
                        literal_headers=literal_headers,
                        is_async=False,
                    )
                ),
            ),
        )

        return class_declaration

    def _create_async_client_wrapper_class_declaration(
        self, *, constructor_parameters: typing.List[ConstructorParameter], literal_headers: typing.List[LiteralHeader]
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(
            constructor_parameters=constructor_parameters,
            literal_headers=literal_headers,
        )

        named_parameters.append(
            AST.NamedFunctionParameter(
                name=ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME,
                type_hint=AST.TypeHint(httpx.HttpX.ASYNC_CLIENT),
            )
        )

        class_declaration = AST.ClassDeclaration(
            name=CoreUtilities.ASYNC_CLIENT_WRAPPER_CLASS_NAME,
            extends=[AST.ClassReference((ClientWrapperGenerator.BASE_CLIENT_WRAPPER_CLASS_NAME,))],
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(
                    self._get_write_derived_client_wrapper_constructor_body(
                        constructor_parameters=constructor_parameters,
                        literal_headers=literal_headers,
                        is_async=True,
                    )
                ),
            ),
        )

        return class_declaration

    def _get_write_derived_client_wrapper_constructor_body(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
        is_async: bool,
    ) -> CodeWriterFunction:
        has_base_url = get_client_wrapper_url_type(ir=self._context.ir) == ClientWrapperUrlStorage.URL

        def _write_derived_client_wrapper_constructor_body(writer: AST.NodeWriter) -> None:
            # Avoid repeating parameters by tracking names
            seen_param_names = set()
            param_assignments = []
            for param in constructor_parameters:
                if param.constructor_parameter_name not in seen_param_names:
                    param_assignments.append(f"{param.constructor_parameter_name}={param.constructor_parameter_name}")
                    seen_param_names.add(param.constructor_parameter_name)
            writer.write_line(
                "super().__init__("
                + ", ".join(
                    param_assignments
                    + [
                        f"{literal_header.constructor_parameter_name}={literal_header.constructor_parameter_name}"
                        for literal_header in literal_headers
                    ]
                )
                + ")"
            )
            writer.write(f"self.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME} = ")
            writer.write_node(
                self._context.core_utilities.http_client(
                    base_client=AST.Expression(ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME),
                    base_url=(
                        AST.Expression(f"self.{ClientWrapperGenerator.GET_BASE_URL_METHOD_NAME}")
                        if has_base_url
                        else None
                    ),
                    base_headers=AST.Expression(f"self.{ClientWrapperGenerator.GET_HEADERS_METHOD_NAME}"),
                    base_timeout=AST.Expression(f"self.{ClientWrapperGenerator.GET_TIMEOUT_METHOD_NAME}"),
                    is_async=is_async,
                )
            )

        return _write_derived_client_wrapper_constructor_body

    def _get_named_parameters(
        self, *, constructor_parameters: List[ConstructorParameter], literal_headers: List[LiteralHeader]
    ) -> typing.List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
            )
            for param in constructor_parameters
        ] + [
            AST.NamedFunctionParameter(
                name=literal_header.constructor_parameter_name,
                type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                initializer=AST.Expression(AST.TypeHint.none()),
            )
            for literal_header in literal_headers
        ]

    def _get_write_get_headers_body(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
        project: Project,
    ) -> CodeWriterFunction:
        def _write_get_headers_body(writer: AST.NodeWriter) -> None:
            writer.write("headers: ")
            writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()))
            writer.write_line("= {")
            if self._context.ir.sdk_config.platform_headers.user_agent is not None:
                writer.write_line(
                    f'"{self._context.ir.sdk_config.platform_headers.user_agent.header}": "{self._context.ir.sdk_config.platform_headers.user_agent.value}",'
                )
            writer.write_line(f'"{self._context.ir.sdk_config.platform_headers.language}": "Python",')
            if project._project_config is not None:
                writer.write_line(
                    f'"{self._context.ir.sdk_config.platform_headers.sdk_name}": "{project._project_config.package_name}",'
                )
                writer.write_line(
                    f'"{self._context.ir.sdk_config.platform_headers.sdk_version}": "{project._project_config.package_version}",'
                )
            writer.write_line("**(self.get_custom_headers() or {}),")
            writer.write_line("}")
            writer.write_newline_if_last_line_not()
            basic_auth_scheme = self._get_basic_auth_scheme()
            if basic_auth_scheme is not None:
                if not self._context.ir.sdk_config.is_auth_mandatory:
                    username_var = names.get_username_constructor_parameter_name(basic_auth_scheme)
                    password_var = names.get_password_constructor_parameter_name(basic_auth_scheme)
                    writer.write_line(f"{username_var} = self.{names.get_username_getter_name(basic_auth_scheme)}()")
                    writer.write_line(f"{password_var} = self.{names.get_password_getter_name(basic_auth_scheme)}()")
                    writer.write_line(f"if {username_var} is not None and {password_var} is not None:")
                    with writer.indent():
                        writer.write(f'headers["{ClientWrapperGenerator.AUTHORIZATION_HEADER}"] = ')
                        writer.write_node(
                            AST.ClassInstantiation(
                                class_=httpx.HttpX.BASIC_AUTH,
                                args=[
                                    AST.Expression(f"{username_var}"),
                                    AST.Expression(f"{password_var}"),
                                ],
                            )
                        )
                        writer.write("._auth_header")
                        writer.write_newline_if_last_line_not()
                else:
                    writer.write(f'headers["{ClientWrapperGenerator.AUTHORIZATION_HEADER}"] = ')
                    writer.write_node(
                        AST.ClassInstantiation(
                            class_=httpx.HttpX.BASIC_AUTH,
                            args=[
                                AST.Expression(f"self.{names.get_username_getter_name(basic_auth_scheme)}()"),
                                AST.Expression(f"self.{names.get_password_getter_name(basic_auth_scheme)}()"),
                            ],
                        )
                    )
                    writer.write("._auth_header")
                    writer.write_newline_if_last_line_not()
            for param in constructor_parameters:
                if param.is_basic:
                    continue
                if param.header_key is not None:
                    if param.header_prefix is not None:
                        if param.getter_method is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(
                                    f"{param.constructor_parameter_name} = self.{param.getter_method.name}()"
                                )
                                writer.write_line(f"if {param.constructor_parameter_name} is not None:")
                                with writer.indent():
                                    writer.write_line(
                                        f'headers["{param.header_key}"] = f"{param.header_prefix} {{{param.constructor_parameter_name}}}"'
                                    )
                            else:
                                writer.write_line(
                                    f'headers["{param.header_key}"] = f"{param.header_prefix} {{self.{param.getter_method.name}()}}"'
                                )
                        elif param.private_member_name is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(f"if self.{param.private_member_name} is not None:")
                                writer.indent()
                            writer.write_line(
                                f'headers["{param.header_key}"] = f"{param.header_prefix} {{self.{param.private_member_name}}}"'
                            )
                            if param.type_hint.is_optional:
                                writer.outdent()
                    else:
                        if param.getter_method is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(
                                    f"{param.constructor_parameter_name} = self.{param.getter_method.name}()"
                                )
                                writer.write_line(f"if {param.constructor_parameter_name} is not None:")
                                with writer.indent():
                                    writer.write_line(
                                        f'headers["{param.header_key}"] = {param.constructor_parameter_name}'
                                    )
                            else:
                                writer.write_line(f'headers["{param.header_key}"] = self.{param.getter_method.name}()')
                        elif param.private_member_name is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(f"if self.{param.private_member_name} is not None:")
                                writer.indent()
                            writer.write_line(f'headers["{param.header_key}"] = self.{param.private_member_name}')
                            if param.type_hint.is_optional:
                                writer.outdent()
            for literal_header in literal_headers:
                private_member_name = literal_header.private_member_name
                writer.write(
                    f'headers["{literal_header.header_key}"] = self.{private_member_name} if self.{private_member_name} is not None else "{self._context.get_literal_header_value(literal_header.header)}"'
                )
                writer.write_line()
            writer.write_line("return headers")

        return _write_get_headers_body

    def _get_write_constructor_body(
        self, *, constructor_parameters: List[ConstructorParameter], literal_headers: List[LiteralHeader]
    ) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            params_empty = True
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
                    params_empty = False
            for literal_header in literal_headers:
                writer.write_line(
                    f"self.{literal_header.private_member_name} = {literal_header.constructor_parameter_name}"
                )
                params_empty = False
            if params_empty:
                writer.write_line("pass")

        return _write_constructor_body

    def _get_constructor_info(self, exclude_auth: bool = False) -> ConstructorInfo:
        parameters: List[ConstructorParameter] = []
        literal_headers: List[LiteralHeader] = []

        for variable in self._context.ir.variables:
            variable_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                variable.type
            )
            constructor_parameter_name = names.get_variable_constructor_parameter_name(variable)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_variable_member_name(variable),
                    type_hint=variable_type_hint,
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{variable.name.screaming_snake_case.safe_name}"'
                    ),
                    docs=variable.docs,
                )
            )

        # TODO(dsinghvi): Support suppliers for global headers
        for header in self._context.ir.headers:
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(header.value_type)
            if type_hint.is_literal:
                literal_headers.append(
                    LiteralHeader(
                        constructor_parameter_name=names.get_header_constructor_parameter_name(header),
                        private_member_name=names.get_header_private_member_name(header),
                        header=header,
                        header_key=header.name.wire_value,
                    )
                )
                continue
            constructor_parameter_name = names.get_header_constructor_parameter_name(header)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_header_private_member_name(header),
                    type_hint=type_hint,
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{header.name.name.screaming_snake_case.safe_name}"',
                    ),
                    header_key=header.name.wire_value,
                    environment_variable=header.env,
                )
            )

        if exclude_auth:
            return ConstructorInfo(
                constructor_parameters=parameters,
                literal_headers=literal_headers,
            )

        # TODO(dsinghvi): Support suppliers for header auth schemes
        for header_auth_scheme in self._get_header_auth_schemes():
            constructor_parameter_name = names.get_auth_scheme_header_constructor_parameter_name(header_auth_scheme)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_auth_scheme_header_private_member_name(header_auth_scheme),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        header_auth_scheme.value_type
                    ),
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{header_auth_scheme.name.name.screaming_snake_case.safe_name}"',
                    ),
                    header_key=header_auth_scheme.name.wire_value,
                    header_prefix=header_auth_scheme.prefix,
                    environment_variable=(
                        header_auth_scheme.header_env_var if header_auth_scheme.header_env_var is not None else None
                    ),
                )
            )

        bearer_auth_scheme = self._get_bearer_auth_scheme()
        if bearer_auth_scheme is not None:
            constructor_parameter_name = names.get_token_constructor_parameter_name(bearer_auth_scheme)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_token_member_name(bearer_auth_scheme),
                    type_hint=(
                        ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                    ),
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{bearer_auth_scheme.token.screaming_snake_case.safe_name}"',
                    ),
                    getter_method=AST.FunctionDeclaration(
                        name=names.get_token_getter_name(bearer_auth_scheme),
                        signature=AST.FunctionSignature(
                            parameters=[],
                            return_type=(
                                AST.TypeHint.str_()
                                if self._context.ir.sdk_config.is_auth_mandatory
                                else AST.TypeHint.optional(AST.TypeHint.str_())
                            ),
                        ),
                        body=AST.CodeWriter(
                            self._get_required_getter_body_writer(
                                member_name=names.get_token_member_name(bearer_auth_scheme)
                            )
                            if self._context.ir.sdk_config.is_auth_mandatory
                            else self._get_optional_getter_body_writer(
                                member_name=names.get_token_member_name(bearer_auth_scheme)
                            )
                        ),
                    ),
                    header_key=ClientWrapperGenerator.AUTHORIZATION_HEADER,
                    header_prefix=ClientWrapperGenerator.BEARER_AUTH_PREFIX,
                    environment_variable=(
                        bearer_auth_scheme.token_env_var if bearer_auth_scheme.token_env_var is not None else None
                    ),
                    template=TemplateGenerator.string_template(
                        is_optional=False,
                        template_string_prefix=constructor_parameter_name,
                        inputs=[
                            TemplateInput.factory.payload(
                                PayloadInput(
                                    location="AUTH",
                                    path="token",
                                )
                            )
                        ],
                    ),
                )
            )

        basic_auth_scheme = self._get_basic_auth_scheme()
        if basic_auth_scheme is not None:
            username_constructor_parameter_name = names.get_username_constructor_parameter_name(basic_auth_scheme)
            username_constructor_parameter = ConstructorParameter(
                constructor_parameter_name=username_constructor_parameter_name,
                private_member_name=names.get_username_member_name(basic_auth_scheme),
                type_hint=(
                    ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                    if self._context.ir.sdk_config.is_auth_mandatory
                    else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                ),
                initializer=AST.Expression(
                    f'{username_constructor_parameter_name}="YOUR_{basic_auth_scheme.username.screaming_snake_case.safe_name}"',
                ),
                getter_method=AST.FunctionDeclaration(
                    name=names.get_username_getter_name(basic_auth_scheme),
                    signature=AST.FunctionSignature(
                        parameters=[],
                        return_type=(
                            AST.TypeHint.str_()
                            if self._context.ir.sdk_config.is_auth_mandatory
                            else AST.TypeHint.optional(AST.TypeHint.str_())
                        ),
                    ),
                    body=AST.CodeWriter(
                        self._get_required_getter_body_writer(
                            member_name=names.get_username_member_name(basic_auth_scheme)
                        )
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else self._get_optional_getter_body_writer(
                            member_name=names.get_username_member_name(basic_auth_scheme)
                        )
                    ),
                ),
                environment_variable=(
                    basic_auth_scheme.username_env_var if basic_auth_scheme.username_env_var is not None else None
                ),
                is_basic=True,
                template=TemplateGenerator.string_template(
                    is_optional=False,
                    template_string_prefix=username_constructor_parameter_name,
                    inputs=[
                        TemplateInput.factory.payload(
                            PayloadInput(
                                location="AUTH",
                                path="username",
                            )
                        ),
                    ],
                ),
            )
            password_constructor_parameter_name = names.get_password_constructor_parameter_name(basic_auth_scheme)
            password_constructor_parameter = ConstructorParameter(
                constructor_parameter_name=password_constructor_parameter_name,
                private_member_name=names.get_password_member_name(basic_auth_scheme),
                type_hint=(
                    ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                    if self._context.ir.sdk_config.is_auth_mandatory
                    else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                ),
                initializer=AST.Expression(
                    f'{password_constructor_parameter_name}="YOUR_{basic_auth_scheme.password.screaming_snake_case.safe_name}"',
                ),
                getter_method=AST.FunctionDeclaration(
                    name=names.get_password_getter_name(basic_auth_scheme),
                    signature=AST.FunctionSignature(
                        parameters=[],
                        return_type=(
                            AST.TypeHint.str_()
                            if self._context.ir.sdk_config.is_auth_mandatory
                            else AST.TypeHint.optional(AST.TypeHint.str_())
                        ),
                    ),
                    body=AST.CodeWriter(
                        self._get_required_getter_body_writer(
                            member_name=names.get_password_member_name(basic_auth_scheme)
                        )
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else self._get_optional_getter_body_writer(
                            member_name=names.get_password_member_name(basic_auth_scheme)
                        )
                    ),
                ),
                is_basic=True,
                environment_variable=(
                    basic_auth_scheme.password_env_var if basic_auth_scheme.password_env_var is not None else None
                ),
                template=TemplateGenerator.string_template(
                    is_optional=False,
                    template_string_prefix=password_constructor_parameter_name,
                    inputs=[
                        TemplateInput.factory.payload(
                            PayloadInput(
                                location="AUTH",
                                path="password",
                            )
                        ),
                    ],
                ),
            )
            parameters.extend(
                [
                    username_constructor_parameter,
                    password_constructor_parameter,
                ]
            )

        # Add generic headers parameter
        headers_constructor_parameter = ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.HEADERS_CONSTRUCTOR_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())),
            private_member_name=ClientWrapperGenerator.HEADERS_MEMBER_NAME,
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_CUSTOM_HEADERS_METHOD_NAME,
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint.optional(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()))
                ),
                body=AST.CodeWriter(f"return self.{ClientWrapperGenerator.HEADERS_MEMBER_NAME}"),
            ),
            docs=ClientWrapperGenerator.HEADERS_CONSTRUCTOR_PARAMETER_DOCS,
        )
        parameters.append(headers_constructor_parameter)

        return ConstructorInfo(
            constructor_parameters=parameters,
            literal_headers=literal_headers,
        )

    def _get_optional_getter_body_writer(self, *, member_name: str) -> AST.CodeWriterFunction:
        def _write_optional_getter_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if isinstance(self.{member_name}, str) or self.{member_name} is None:")
            with writer.indent():
                writer.write_line(f"return self.{member_name}")
            writer.write_line("else:")
            with writer.indent():
                writer.write_line(f"return self.{member_name}()")

        return _write_optional_getter_body

    def _get_required_getter_body_writer(self, *, member_name: str) -> AST.CodeWriterFunction:
        def _write_required_getter_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if isinstance(self.{member_name}, str):")
            with writer.indent():
                writer.write_line(f"return self.{member_name}")
            writer.write_line("else:")
            with writer.indent():
                writer.write_line(f"return self.{member_name}()")

        return _write_required_getter_body

    def _get_bearer_auth_scheme(self) -> Optional[ir_types.BearerAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "bearer":
                return scheme_as_union

        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "oauth":
                # TODO: For now, we create the default bearer auth scheme if the auth scheme is oauth.
                #
                #       This should be eventually be handled in the IR when we can support multiple auth
                #       schemes.
                #
                # TODO: We need to support the token prefix. This will actually need to be handled as a
                #       custom header auth scheme.
                return ir_types.BearerAuthScheme(
                    key="bearer",
                    token=ir_types.Name(
                        original_name="token",
                        camel_case=ir_types.SafeAndUnsafeString(
                            safe_name="token",
                            unsafe_name="token",
                        ),
                        pascal_case=ir_types.SafeAndUnsafeString(
                            safe_name="Token",
                            unsafe_name="Token",
                        ),
                        snake_case=ir_types.SafeAndUnsafeString(
                            safe_name="token",
                            unsafe_name="token",
                        ),
                        screaming_snake_case=ir_types.SafeAndUnsafeString(
                            safe_name="TOKEN",
                            unsafe_name="TOKEN",
                        ),
                    ),
                )
        return None

    def _has_basic_auth(self) -> bool:
        return self._get_basic_auth_scheme() is not None

    def _get_basic_auth_scheme(self) -> Optional[ir_types.BasicAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "basic":
                return scheme_as_union
        return None

    def _get_header_auth_schemes(self) -> List[ir_types.HeaderAuthScheme]:
        header_auth_schemes: List[ir_types.HeaderAuthScheme] = []
        for scheme in self._context.ir.auth.schemes:
            scheme_member = scheme.get_as_union()
            if scheme_member.type == "header":
                header_auth_schemes.append(scheme_member)
        return header_auth_schemes

    def _get_environment_instantiation(
        self,
        generated_environment: Optional[GeneratedEnvironment],
    ) -> Optional[AST.Expression]:
        if generated_environment is None:
            return None

        def write_environment_parameter(writer: AST.NodeWriter) -> None:
            if generated_environment is None:
                return

            writer.write(f"{ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME}=")
            writer.write_node(AST.Expression(generated_environment.class_reference))
            writer.write(f".{generated_environment.example_environment}")

        return AST.Expression(AST.CodeWriter(write_environment_parameter))


class ClientWrapperUrlStorage(Enum):
    URL = "url"
    ENVIRONMENT = "environment"


def get_client_wrapper_url_type(*, ir: ir_types.IntermediateRepresentation) -> ClientWrapperUrlStorage:
    if ir.environments is None:
        return ClientWrapperUrlStorage.URL
    environment = ir.environments.environments.get_as_union()
    if environment.type == "singleBaseUrl":
        return ClientWrapperUrlStorage.URL
    elif environment.type == "multipleBaseUrls":
        return ClientWrapperUrlStorage.ENVIRONMENT
    raise Exception(f"Encountered unknown environment type: {environment.type}")
