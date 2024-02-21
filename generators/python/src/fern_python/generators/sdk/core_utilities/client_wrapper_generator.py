import typing
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, Project, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import httpx
from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities

from ..context.sdk_generator_context import SdkGeneratorContext
from ..environment_generators import GeneratedEnvironment


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    private_member_name: str
    instantiation: typing.Optional[AST.Expression] = None
    getter_method: typing.Optional[AST.FunctionDeclaration] = None
    header_key: typing.Optional[str] = None
    header_prefix: typing.Optional[str] = None
    environment_variable: typing.Optional[str] = None
    is_basic: bool = False
    docs: typing.Optional[str] = None


@dataclass
class LiteralHeader:
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
    GET_ENVIRONMENT_METHOD_NAME = "get_environment"

    BASE_URL_PARAMETER_NAME = "base_url"
    ENVIRONMENT_PARAMETER_NAME = "environment"

    HTTPX_CLIENT_MEMBER_NAME = "httpx_client"

    STRING_OR_SUPPLIER_TYPE_HINT = AST.TypeHint.union(
        AST.TypeHint.str_(), AST.TypeHint.callable(parameters=[], return_type=AST.TypeHint.str_())
    )

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
        constructor_parameters = [param for param in constructor_info.constructor_parameters]
        constructor_parameters.append(url_constructor_param)

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
                constructor_parameters=constructor_parameters
            ),
            should_export=True,
        )
        source_file.add_class_declaration(
            declaration=self._create_async_client_wrapper_class_declaration(
                constructor_parameters=constructor_parameters
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
            instantiation=AST.Expression(
                f'{ClientWrapperGenerator.BASE_URL_PARAMETER_NAME}="https://yourhost.com/path/to/api"',
            ),
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_BASE_URL_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.str_()),
                body=AST.CodeWriter(f"return self._{ClientWrapperGenerator.BASE_URL_PARAMETER_NAME}"),
            ),
        )

    def _get_environment_constructor_parameter(self) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME,
            type_hint=AST.TypeHint(self._context.get_reference_to_environments_class()),
            private_member_name=f"_{ClientWrapperGenerator.ENVIRONMENT_PARAMETER_NAME}",
            instantiation=self._get_environment_instantiation(
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
        named_parameters = self._get_named_parameters(constructor_parameters=constructor_parameters)

        class_declaration = AST.ClassDeclaration(
            name=ClientWrapperGenerator.BASE_CLIENT_WRAPPER_CLASS_NAME,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body(constructor_parameters=constructor_parameters)),
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
        self, *, constructor_parameters: typing.List[ConstructorParameter]
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(constructor_parameters=constructor_parameters)

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
                        constructor_parameters=constructor_parameters
                    )
                ),
            ),
        )

        return class_declaration

    def _create_async_client_wrapper_class_declaration(
        self, *, constructor_parameters: typing.List[ConstructorParameter]
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(constructor_parameters=constructor_parameters)

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
                        constructor_parameters=constructor_parameters
                    )
                ),
            ),
        )

        return class_declaration

    def _get_write_derived_client_wrapper_constructor_body(
        self, *, constructor_parameters: List[ConstructorParameter]
    ) -> CodeWriterFunction:
        def _write_derived_client_wrapper_constructor_body(writer: AST.NodeWriter) -> None:
            writer.write_line(
                "super().__init__("
                + ", ".join(
                    [
                        f"{param.constructor_parameter_name}={param.constructor_parameter_name}"
                        for param in constructor_parameters
                    ]
                )
                + ")"
            )
            writer.write_line(
                f"self.{ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME} = {ClientWrapperGenerator.HTTPX_CLIENT_MEMBER_NAME}"
            )

        return _write_derived_client_wrapper_constructor_body

    def _get_named_parameters(
        self, *, constructor_parameters: List[ConstructorParameter]
    ) -> typing.List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
            )
            for param in constructor_parameters
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
            writer.write_line(f'"{self._context.ir.sdk_config.platform_headers.language}": "Python",')
            if project._project_config is not None:
                writer.write_line(
                    f'"{self._context.ir.sdk_config.platform_headers.sdk_name}": "{project._project_config.package_name}",'
                )
                writer.write_line(
                    f'"{self._context.ir.sdk_config.platform_headers.sdk_version}": "{project._project_config.package_version}",'
                )
            writer.write_line("}")
            writer.write_newline_if_last_line_not()
            basic_auth_scheme = self._get_basic_auth_scheme()
            if basic_auth_scheme is not None:
                if not self._context.ir.sdk_config.is_auth_mandatory:
                    username_var = self._get_username_constructor_parameter_name(basic_auth_scheme)
                    password_var = self._get_password_constructor_parameter_name(basic_auth_scheme)
                    writer.write_line(f"{username_var} = self.{self._get_username_getter_name(basic_auth_scheme)}()")
                    writer.write_line(f"{password_var} = self.{self._get_password_getter_name(basic_auth_scheme)}()")
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
                                AST.Expression(f"self.{self._get_username_getter_name(basic_auth_scheme)}()"),
                                AST.Expression(f"self.{self._get_password_getter_name(basic_auth_scheme)}()"),
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
                writer.write(
                    f'headers["{literal_header.header_key}"] = "{self._context.get_literal_header_value(literal_header.header)}"'
                )
                writer.write_line()
            writer.write_line("return headers")

        return _write_get_headers_body

    def _get_write_constructor_body(self, *, constructor_parameters: List[ConstructorParameter]) -> CodeWriterFunction:
        def _write_constructor_body(writer: AST.NodeWriter) -> None:
            params_empty = True
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_line(f"self.{param.private_member_name} = {param.constructor_parameter_name}")
                    params_empty = False
            if params_empty:
                writer.write_line("pass")

        return _write_constructor_body

    def _get_constructor_info(self) -> ConstructorInfo:
        parameters: List[ConstructorParameter] = []
        literal_headers: List[LiteralHeader] = []

        # TODO(dsinghvi): Support suppliers for global headers
        for header in self._context.ir.headers:
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(header.value_type)
            if type_hint.is_literal:
                literal_headers.append(
                    LiteralHeader(
                        header=header,
                        header_key=header.name.wire_value,
                    )
                )
                continue
            constructor_parameter_name = self._get_header_constructor_parameter_name(header)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=self._get_header_private_member_name(header),
                    type_hint=type_hint,
                    instantiation=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{header.name.name.screaming_snake_case.safe_name}"',
                    ),
                    header_key=header.name.wire_value,
                )
            )

        # TODO(dsinghvi): Support suppliers for header auth schemes
        for header_auth_scheme in self._get_header_auth_schemes():
            constructor_parameter_name = self._get_auth_scheme_header_constructor_parameter_name(header_auth_scheme)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=self._get_auth_scheme_header_private_member_name(header_auth_scheme),
                    type_hint=self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                        header_auth_scheme.value_type
                    ),
                    instantiation=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{header_auth_scheme.name.name.screaming_snake_case.safe_name}"',
                    ),
                    header_key=header_auth_scheme.name.wire_value,
                    header_prefix=header_auth_scheme.prefix,
                    environment_variable=header_auth_scheme.header_env_var.get_as_str()
                    if header_auth_scheme.header_env_var is not None
                    else None,
                )
            )

        bearer_auth_scheme = self._get_bearer_auth_scheme()
        if bearer_auth_scheme is not None:
            constructor_parameter_name = self._get_token_constructor_parameter_name(bearer_auth_scheme)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=self._get_token_member_name(bearer_auth_scheme),
                    type_hint=ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                    if self._context.ir.sdk_config.is_auth_mandatory
                    else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT),
                    instantiation=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{bearer_auth_scheme.token.screaming_snake_case.safe_name}"',
                    ),
                    getter_method=AST.FunctionDeclaration(
                        name=self._get_token_getter_name(bearer_auth_scheme),
                        signature=AST.FunctionSignature(
                            parameters=[],
                            return_type=AST.TypeHint.str_()
                            if self._context.ir.sdk_config.is_auth_mandatory
                            else AST.TypeHint.optional(AST.TypeHint.str_()),
                        ),
                        body=AST.CodeWriter(
                            self._get_required_getter_body_writer(
                                member_name=self._get_token_member_name(bearer_auth_scheme)
                            )
                            if self._context.ir.sdk_config.is_auth_mandatory
                            else self._get_optional_getter_body_writer(
                                member_name=self._get_token_member_name(bearer_auth_scheme)
                            )
                        ),
                    ),
                    header_key=ClientWrapperGenerator.AUTHORIZATION_HEADER,
                    header_prefix=ClientWrapperGenerator.BEARER_AUTH_PREFIX,
                    environment_variable=bearer_auth_scheme.token_env_var.get_as_str()
                    if bearer_auth_scheme.token_env_var is not None
                    else None,
                )
            )

        basic_auth_scheme = self._get_basic_auth_scheme()
        if basic_auth_scheme is not None:
            username_constructor_parameter_name = self._get_username_constructor_parameter_name(basic_auth_scheme)
            username_constructor_parameter = ConstructorParameter(
                constructor_parameter_name=username_constructor_parameter_name,
                private_member_name=self._get_username_member_name(basic_auth_scheme),
                type_hint=ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                if self._context.ir.sdk_config.is_auth_mandatory
                else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT),
                instantiation=AST.Expression(
                    f'{username_constructor_parameter_name}="YOUR_{basic_auth_scheme.username.screaming_snake_case.safe_name}"',
                ),
                getter_method=AST.FunctionDeclaration(
                    name=self._get_username_getter_name(basic_auth_scheme),
                    signature=AST.FunctionSignature(
                        parameters=[],
                        return_type=AST.TypeHint.str_()
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                    body=AST.CodeWriter(
                        self._get_required_getter_body_writer(
                            member_name=self._get_username_member_name(basic_auth_scheme)
                        )
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else self._get_optional_getter_body_writer(
                            member_name=self._get_username_member_name(basic_auth_scheme)
                        )
                    ),
                ),
                environment_variable=basic_auth_scheme.username_env_var.get_as_str()
                if basic_auth_scheme.username_env_var is not None
                else None,
                is_basic=True,
            )
            password_constructor_parameter_name = self._get_password_constructor_parameter_name(basic_auth_scheme)
            password_constructor_parameter = ConstructorParameter(
                constructor_parameter_name=password_constructor_parameter_name,
                private_member_name=self._get_password_member_name(basic_auth_scheme),
                type_hint=ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                if self._context.ir.sdk_config.is_auth_mandatory
                else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT),
                instantiation=AST.Expression(
                    f'{password_constructor_parameter_name}="YOUR_{basic_auth_scheme.password.screaming_snake_case.safe_name}"',
                ),
                getter_method=AST.FunctionDeclaration(
                    name=self._get_password_getter_name(basic_auth_scheme),
                    signature=AST.FunctionSignature(
                        parameters=[],
                        return_type=AST.TypeHint.str_()
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else AST.TypeHint.optional(AST.TypeHint.str_()),
                    ),
                    body=AST.CodeWriter(
                        self._get_required_getter_body_writer(
                            member_name=self._get_password_member_name(basic_auth_scheme)
                        )
                        if self._context.ir.sdk_config.is_auth_mandatory
                        else self._get_optional_getter_body_writer(
                            member_name=self._get_password_member_name(basic_auth_scheme)
                        )
                    ),
                ),
                is_basic=True,
                environment_variable=basic_auth_scheme.password_env_var.get_as_str()
                if basic_auth_scheme.password_env_var is not None
                else None,
            )
            parameters.extend(
                [
                    username_constructor_parameter,
                    password_constructor_parameter,
                ]
            )

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
        return None

    def _has_basic_auth(self) -> bool:
        return self._get_basic_auth_scheme() is not None

    def _get_basic_auth_scheme(self) -> Optional[ir_types.BasicAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "basic":
                return scheme_as_union
        return None

    def _get_username_constructor_parameter_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return basic_auth_scheme.username.snake_case.safe_name

    def _get_username_getter_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return f"_get_{basic_auth_scheme.username.snake_case.unsafe_name}"

    def _get_username_member_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return f"_{basic_auth_scheme.username.snake_case.unsafe_name}"

    def _get_password_constructor_parameter_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return basic_auth_scheme.password.snake_case.safe_name

    def _get_token_constructor_parameter_name(self, bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
        return bearer_auth_scheme.token.snake_case.safe_name

    def _get_token_member_name(self, bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
        return f"_{bearer_auth_scheme.token.snake_case.safe_name}"

    def _get_token_getter_name(self, bearer_auth_scheme: ir_types.BearerAuthScheme) -> str:
        return f"_get_{bearer_auth_scheme.token.snake_case.safe_name}"

    def _get_password_getter_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return f"_get_{basic_auth_scheme.password.snake_case.unsafe_name}"

    def _get_password_member_name(self, basic_auth_scheme: ir_types.BasicAuthScheme) -> str:
        return f"_{basic_auth_scheme.password.snake_case.unsafe_name}"

    def _get_header_auth_schemes(self) -> List[ir_types.HeaderAuthScheme]:
        header_auth_schemes: List[ir_types.HeaderAuthScheme] = []
        for scheme in self._context.ir.auth.schemes:
            scheme_member = scheme.get_as_union()
            if scheme_member.type == "header":
                header_auth_schemes.append(scheme_member)
        return header_auth_schemes

    def _get_header_parameter_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_header_private_member_name(self, header: ir_types.HttpHeader) -> str:
        return "_" + header.name.name.snake_case.unsafe_name

    def _get_header_constructor_parameter_name(self, header: ir_types.HttpHeader) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_auth_scheme_header_constructor_parameter_name(self, header: ir_types.HeaderAuthScheme) -> str:
        return header.name.name.snake_case.unsafe_name

    def _get_auth_scheme_header_private_member_name(self, header: ir_types.HeaderAuthScheme) -> str:
        return header.name.name.snake_case.unsafe_name

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
