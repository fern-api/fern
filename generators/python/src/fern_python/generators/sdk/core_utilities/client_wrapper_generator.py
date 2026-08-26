import json
import re
import typing
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional

import fern_python.generators.sdk.names as names
from ..context.sdk_generator_context import SdkGeneratorContext
from ..environment_generators import GeneratedEnvironment
from fdr import PayloadInput, Template, TemplateInput
from fern_python.codegen import AST, Project, SourceFile
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriterFunction
from fern_python.external_dependencies import httpx
from fern_python.generators.sdk.client_generator.base_client_generator import (
    ConstructorParameter as BaseClientGeneratorConstructorParameter,
)
from fern_python.generators.sdk.client_generator.type_utilities import (
    is_type_reference_string,
)
from fern_python.generators.sdk.core_utilities.core_utilities import CoreUtilities
from fern_python.snippet.template_utils import TemplateGenerator
from fern_python.utils import get_name_from_wire_value, get_wire_value, resolve_name

import fern.ir.resources as ir_types


def _get_user_agent_coordinate_prefix(user_agent_value: str) -> typing.Optional[str]:
    """Returns the User-Agent value up to and including the separator preceding its version.

    The version segment is dropped so a runtime-resolved version can be appended in its
    place. Returns None when the value does not end in a version, since the product name
    itself may contain a separator (e.g. `@acme/sdk`).
    """
    separator_index = user_agent_value.rfind("/")
    if separator_index < 0:
        return None
    version = user_agent_value[separator_index + 1 :]
    if re.match(r"^v?\d", version) is None:
        return None
    return user_agent_value[: separator_index + 1]


# Source for the self-contained `_append_app_info_to_user_agent` helper emitted into the
# generated client wrapper module only when the `allow_user_agent_app_info` config is
# enabled. It is intentionally standalone (rather than shipped in the always-copied
# `core` utilities) so that clients which do not opt into `allow_user_agent_app_info`
# keep byte-identical generated output. Only depends on the stdlib `typing` module,
# which is always imported into the generated client wrapper.
#
# Sanitizes caller-supplied values: `name`/`version` are token-encoded (every
# non-RFC-7230 `tchar` is percent-encoded, including spaces, control characters and
# CR/LF) and `comment` has its delimiters (`(`, `)`, `\`) and control characters
# (incl. CR/LF) percent-encoded, so untrusted values cannot inject additional header
# content. Each value is trimmed before encoding so blank values are treated as absent
# rather than encoded into whitespace tokens. Formats the appended product token as
# `{name}/{version} ({comment})`, dropping `/version` and ` (comment)` when blank, and
# returns the User-Agent unchanged when `app_info`/`name` is absent.
#
# The `app_info` argument is a mapping with a required `name` and optional `version` /
# `comment` string entries, e.g. `{"name": "partner-app", "version": "3.1.0"}`.
APPEND_APP_INFO_HELPER_SOURCE = """
def _append_app_info_to_user_agent(
    user_agent: str, app_info: typing.Optional[typing.Dict[str, str]]
) -> str:
    if app_info is None:
        return user_agent

    def _percent_encode_char(char: str) -> str:
        return "".join(f"%{byte:02X}" for byte in char.encode("utf-8"))

    # RFC 7230 token = 1*tchar. Any character outside that set is percent-encoded so it
    # cannot break out of the product token or inject additional header content.
    _tchar = "!#$%&\\'*+-.^_`|~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    def _encode_token(value: str) -> str:
        return "".join(c if c in _tchar else _percent_encode_char(c) for c in value)

    # Escape the comment delimiters `(`, `)`, `\\` and control characters (0x00-0x1F,
    # 0x7F, incl. CR/LF), and percent-encode any non-ASCII byte (>= 0x80) so a
    # caller-supplied comment cannot terminate the comment group early, inject additional
    # header content, or raise a UnicodeEncodeError when httpx ASCII-encodes the header.
    def _encode_comment(value: str) -> str:
        return "".join(
            _percent_encode_char(c) if c in "()\\\\" or ord(c) < 0x20 or ord(c) >= 0x7F else c
            for c in value
        )

    name = _encode_token((app_info.get("name") or "").strip())
    if not name:
        return user_agent
    product_token = name
    version = _encode_token((app_info.get("version") or "").strip())
    if version:
        product_token += f"/{version}"
    comment = _encode_comment((app_info.get("comment") or "").strip())
    if comment:
        product_token += f" ({comment})"
    return f"{user_agent} {product_token}"
"""


@dataclass
class ConstructorParameter(BaseClientGeneratorConstructorParameter):
    getter_method: typing.Optional[AST.FunctionDeclaration] = None
    header_key: typing.Optional[str] = None
    header_prefix: typing.Optional[str] = None
    environment_variable: typing.Optional[str] = None
    is_basic: bool = False
    docs: typing.Optional[str] = None
    template: typing.Optional[Template] = None
    client_default: typing.Optional[AST.Expression] = None
    # True when the underlying fern type is not a string and the value must be
    # wrapped with str(...) to satisfy the Dict[str, str] headers type.
    needs_str_conversion: bool = False
    # True when this parameter corresponds to an auth scheme (bearer token or
    # header auth scheme). Used to skip flat auth-header emission in endpoint
    # security mode, where auth headers are routed per-endpoint instead.
    is_auth: bool = False
    raw_header_value_for_empty_prefix: bool = False


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
    GET_AUTH_HEADERS_FOR_ENDPOINT_METHOD_NAME = "get_auth_headers_for_endpoint"
    ASYNC_GET_AUTH_HEADERS_FOR_ENDPOINT_METHOD_NAME = "async_get_auth_headers_for_endpoint"
    ENDPOINT_SECURITY_PARAMETER_NAME = "security"
    GET_BASE_URL_METHOD_NAME = "get_base_url"
    GET_TIMEOUT_METHOD_NAME = "get_timeout"
    GET_MAX_RETRIES_METHOD_NAME = "get_max_retries"
    GET_ENVIRONMENT_METHOD_NAME = "get_environment"
    GET_STREAM_RECONNECTION_ENABLED_METHOD_NAME = "get_stream_reconnection_enabled"
    GET_MAX_STREAM_RECONNECTION_ATTEMPTS_METHOD_NAME = "get_max_stream_reconnection_attempts"

    BASE_URL_PARAMETER_NAME = "base_url"
    ENVIRONMENT_PARAMETER_NAME = "environment"

    TIMEOUT_PARAMETER_NAME = "timeout"
    MAX_RETRIES_PARAMETER_NAME = "max_retries"
    STREAM_RECONNECTION_ENABLED_PARAMETER_NAME = "stream_reconnection_enabled"
    MAX_STREAM_RECONNECTION_ATTEMPTS_PARAMETER_NAME = "max_stream_reconnection_attempts"

    HTTPX_CLIENT_MEMBER_NAME = "httpx_client"

    LOGGING_PARAMETER_NAME = "logging"
    LOGGING_MEMBER_NAME = "_logging"

    STRING_OR_SUPPLIER_TYPE_HINT = AST.TypeHint.union(
        AST.TypeHint.str_(),
        AST.TypeHint.callable(parameters=[], return_type=AST.TypeHint.str_()),
    )

    HEADERS_CONSTRUCTOR_PARAMETER_NAME = "headers"
    HEADERS_CONSTRUCTOR_PARAMETER_DOCS = "Additional headers to send with every request."
    HEADERS_MEMBER_NAME = "_headers"
    GET_CUSTOM_HEADERS_METHOD_NAME = "get_custom_headers"

    AUTH_HEADERS_CONSTRUCTOR_PARAMETER_NAME = "auth_headers"
    AUTH_HEADERS_MEMBER_NAME = "_auth_headers"

    ASYNC_AUTH_HEADERS_CONSTRUCTOR_PARAMETER_NAME = "async_auth_headers"
    ASYNC_AUTH_HEADERS_MEMBER_NAME = "_async_auth_headers"

    APP_INFO_PARAMETER_NAME = "app_info"
    APP_INFO_MEMBER_NAME = "_app_info"
    APPEND_APP_INFO_HELPER_NAME = "_append_app_info_to_user_agent"

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
        max_retries_param = self._get_max_retries_constructor_parameter()
        logging_param = self._get_logging_constructor_parameter()
        constructor_parameters = [param for param in constructor_info.constructor_parameters]
        constructor_parameters.append(url_constructor_param)
        constructor_parameters.append(timeout_param)
        constructor_parameters.append(max_retries_param)
        stream_reconnection_enabled_param = self._get_stream_reconnection_enabled_constructor_parameter()
        max_stream_reconnection_attempts_param = self._get_max_stream_reconnection_attempts_constructor_parameter()
        constructor_parameters.append(stream_reconnection_enabled_param)
        constructor_parameters.append(max_stream_reconnection_attempts_param)
        constructor_parameters.append(logging_param)

        # Emit the self-contained User-Agent app-info helper into this module only when
        # the opt-in `allow_user_agent_app_info` config is enabled, so that clients which
        # do not opt in keep byte-identical generated output.
        if self._context.custom_config.allow_user_agent_app_info:
            source_file.add_arbitrary_code(AST.CodeWriter(APPEND_APP_INFO_HELPER_SOURCE))

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

    def _get_max_retries_constructor_parameter(self) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.MAX_RETRIES_PARAMETER_NAME,
            type_hint=AST.TypeHint.int_(),
            private_member_name=f"_{ClientWrapperGenerator.MAX_RETRIES_PARAMETER_NAME}",
            initializer=AST.Expression(str(self._context.custom_config.default_max_retries)),
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_MAX_RETRIES_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.int_()),
                body=AST.CodeWriter(f"return self._{ClientWrapperGenerator.MAX_RETRIES_PARAMETER_NAME}"),
            ),
        )

    def _get_stream_reconnection_enabled_constructor_parameter(
        self,
    ) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.STREAM_RECONNECTION_ENABLED_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(AST.TypeHint.bool_()),
            private_member_name=f"_{ClientWrapperGenerator.STREAM_RECONNECTION_ENABLED_PARAMETER_NAME}",
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_STREAM_RECONNECTION_ENABLED_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.bool_()),
                body=AST.CodeWriter(
                    f"return self._{ClientWrapperGenerator.STREAM_RECONNECTION_ENABLED_PARAMETER_NAME} if self._{ClientWrapperGenerator.STREAM_RECONNECTION_ENABLED_PARAMETER_NAME} is not None else True"
                ),
            ),
        )

    def _get_max_stream_reconnection_attempts_constructor_parameter(
        self,
    ) -> ConstructorParameter:
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.MAX_STREAM_RECONNECTION_ATTEMPTS_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(AST.TypeHint.int_()),
            private_member_name=f"_{ClientWrapperGenerator.MAX_STREAM_RECONNECTION_ATTEMPTS_PARAMETER_NAME}",
            getter_method=AST.FunctionDeclaration(
                name=ClientWrapperGenerator.GET_MAX_STREAM_RECONNECTION_ATTEMPTS_METHOD_NAME,
                signature=AST.FunctionSignature(return_type=AST.TypeHint.optional(AST.TypeHint.int_())),
                body=AST.CodeWriter(
                    f"return self._{ClientWrapperGenerator.MAX_STREAM_RECONNECTION_ATTEMPTS_PARAMETER_NAME}"
                ),
            ),
        )

    def _get_logging_constructor_parameter(self) -> ConstructorParameter:
        log_config_ref = self._context.core_utilities.get_reference_to_log_config()
        logger_ref = self._context.core_utilities.get_reference_to_logger()
        return ConstructorParameter(
            constructor_parameter_name=ClientWrapperGenerator.LOGGING_PARAMETER_NAME,
            type_hint=AST.TypeHint.optional(
                AST.TypeHint.union(
                    AST.TypeHint(log_config_ref),
                    AST.TypeHint(logger_ref),
                )
            ),
            private_member_name=ClientWrapperGenerator.LOGGING_MEMBER_NAME,
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

        if self.is_endpoint_security():
            class_declaration.add_method(
                AST.FunctionDeclaration(
                    name=ClientWrapperGenerator.GET_AUTH_HEADERS_FOR_ENDPOINT_METHOD_NAME,
                    signature=AST.FunctionSignature(
                        named_parameters=[
                            AST.NamedFunctionParameter(
                                name=ClientWrapperGenerator.ENDPOINT_SECURITY_PARAMETER_NAME,
                                type_hint=self._get_endpoint_security_type_hint(),
                            )
                        ],
                        return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
                    ),
                    body=AST.CodeWriter(self._get_write_auth_headers_for_endpoint_body(is_async=False)),
                )
            )

        for constructor_param in constructor_parameters:
            if constructor_param.getter_method is not None:
                class_declaration.add_method(constructor_param.getter_method)

        return class_declaration

    def _get_endpoint_security_type_hint(self) -> AST.TypeHint:
        return AST.TypeHint.optional(
            AST.TypeHint.list(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.list(AST.TypeHint.str_())))
        )

    def _create_sync_client_wrapper_class_declaration(
        self,
        *,
        constructor_parameters: typing.List[ConstructorParameter],
        literal_headers: typing.List[LiteralHeader],
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

    ASYNC_TOKEN_PARAMETER_NAME = "async_token"
    ASYNC_TOKEN_MEMBER_NAME = "_async_token"
    ASYNC_GET_HEADERS_METHOD_NAME = "async_get_headers"

    def _create_async_client_wrapper_class_declaration(
        self,
        *,
        constructor_parameters: typing.List[ConstructorParameter],
        literal_headers: typing.List[LiteralHeader],
    ) -> AST.ClassDeclaration:
        named_parameters = self._get_named_parameters(
            constructor_parameters=constructor_parameters,
            literal_headers=literal_headers,
        )

        # Add async_token parameter for async OAuth token providers
        named_parameters.append(
            AST.NamedFunctionParameter(
                name=ClientWrapperGenerator.ASYNC_TOKEN_PARAMETER_NAME,
                type_hint=AST.TypeHint.optional(
                    AST.TypeHint.callable(
                        parameters=[],
                        return_type=AST.TypeHint.awaitable(AST.TypeHint.str_()),
                    )
                ),
                initializer=AST.Expression(AST.TypeHint.none()),
            )
        )

        if self._has_inferred_auth():
            named_parameters.append(
                AST.NamedFunctionParameter(
                    name=ClientWrapperGenerator.ASYNC_AUTH_HEADERS_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint.optional(
                        AST.TypeHint.callable(
                            parameters=[],
                            return_type=AST.TypeHint.awaitable(
                                AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())
                            ),
                        )
                    ),
                    initializer=AST.Expression(AST.TypeHint.none()),
                )
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
                    self._get_write_async_client_wrapper_constructor_body(
                        constructor_parameters=constructor_parameters,
                        literal_headers=literal_headers,
                    )
                ),
            ),
        )

        # Add async_get_headers method
        class_declaration.add_method(
            AST.FunctionDeclaration(
                name=ClientWrapperGenerator.ASYNC_GET_HEADERS_METHOD_NAME,
                signature=AST.FunctionSignature(
                    return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
                ),
                body=AST.CodeWriter(self._get_write_async_get_headers_body()),
                is_async=True,
            )
        )

        if self.is_endpoint_security():
            class_declaration.add_method(
                AST.FunctionDeclaration(
                    name=ClientWrapperGenerator.ASYNC_GET_AUTH_HEADERS_FOR_ENDPOINT_METHOD_NAME,
                    signature=AST.FunctionSignature(
                        named_parameters=[
                            AST.NamedFunctionParameter(
                                name=ClientWrapperGenerator.ENDPOINT_SECURITY_PARAMETER_NAME,
                                type_hint=self._get_endpoint_security_type_hint(),
                            )
                        ],
                        return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
                    ),
                    body=AST.CodeWriter(self._get_write_auth_headers_for_endpoint_body(is_async=True)),
                    is_async=True,
                )
            )

        return class_declaration

    def _get_write_async_get_headers_body(self) -> CodeWriterFunction:
        def _write_async_get_headers_body(writer: AST.NodeWriter) -> None:
            writer.write_line("headers = self.get_headers()")
            # In endpoint-security mode, auth headers are routed per-endpoint, so the
            # async base headers must not inject any auth headers either.
            emit_flat_auth = not self.is_endpoint_security()
            if emit_flat_auth:
                writer.write_line(f"if self.{ClientWrapperGenerator.ASYNC_TOKEN_MEMBER_NAME} is not None:")
                with writer.indent():
                    writer.write_line(f"token = await self.{ClientWrapperGenerator.ASYNC_TOKEN_MEMBER_NAME}()")
                    token_header, token_prefix = self._get_token_header_and_prefix()
                    writer.write_line(
                        f"headers[{json.dumps(token_header)}] = "
                        + self._get_prefixed_header_value(
                            token_prefix,
                            "token",
                            raw_value_for_empty_prefix=True,
                        )
                    )
                if self._has_inferred_auth():
                    writer.write_line(f"if self.{ClientWrapperGenerator.ASYNC_AUTH_HEADERS_MEMBER_NAME} is not None:")
                    with writer.indent():
                        writer.write_line(
                            f"headers.update(await self.{ClientWrapperGenerator.ASYNC_AUTH_HEADERS_MEMBER_NAME}())"
                        )
            writer.write_line("return headers")

        return _write_async_get_headers_body

    def _get_write_auth_headers_for_endpoint_body(self, *, is_async: bool) -> CodeWriterFunction:
        """Generate the body of (async_)get_auth_headers_for_endpoint.

        Mirrors the TypeScript RoutingAuthProvider: given the endpoint's static
        security requirements, build only the auth headers for the FIRST requirement
        whose schemes ALL have credentials available (OR across the list, AND within
        a requirement). If none is satisfiable, raise naming the missing schemes.
        """
        security_param = ClientWrapperGenerator.ENDPOINT_SECURITY_PARAMETER_NAME
        available_var = "available_auth_headers"

        bearer_auth_scheme = self._get_bearer_auth_scheme()
        oauth_scheme = self._get_oauth_scheme()
        header_auth_schemes = self._get_header_auth_schemes()
        basic_auth_scheme = self._get_basic_auth_scheme()
        inferred_auth_scheme = self._get_inferred_auth_scheme()

        # The scheme keys that resolve to a token.
        # Both an explicit bearer scheme and an OAuth scheme share the client wrapper's
        # single token slot (_get_token / _async_token).
        token_schemes: List[typing.Tuple[str, str, str]] = []
        if bearer_auth_scheme is not None and self._has_bearer_scheme():
            token_schemes.append(
                (
                    bearer_auth_scheme.key,
                    ClientWrapperGenerator.AUTHORIZATION_HEADER,
                    ClientWrapperGenerator.BEARER_AUTH_PREFIX,
                )
            )
        if oauth_scheme is not None:
            token_header, token_prefix = self._get_oauth_token_header_and_prefix()
            token_schemes.append((oauth_scheme.key, token_header, token_prefix))

        def _write_auth_headers_for_endpoint_body(writer: AST.NodeWriter) -> None:
            writer.write_line(f"if not {security_param}:")
            with writer.indent():
                writer.write_line("return {}")

            writer.write(f"{available_var}: ")
            writer.write_node(
                AST.TypeHint.dict(
                    AST.TypeHint.str_(),
                    AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
                )
            )
            writer.write_line(" = {}")

            # Bearer / OAuth token schemes
            if len(token_schemes) > 0 and bearer_auth_scheme is not None:
                token_getter = names.get_token_getter_name(bearer_auth_scheme)
                if is_async:
                    # Forward-declare so both branches (async token -> str, sync getter ->
                    # str | None) unify to Optional[str]; otherwise mypy infers `str` from the
                    # first assignment and rejects the else branch.
                    writer.write_line("_token: typing.Optional[str]")
                    writer.write_line(f"if self.{ClientWrapperGenerator.ASYNC_TOKEN_MEMBER_NAME} is not None:")
                    with writer.indent():
                        writer.write_line(f"_token = await self.{ClientWrapperGenerator.ASYNC_TOKEN_MEMBER_NAME}()")
                    writer.write_line("else:")
                    with writer.indent():
                        writer.write_line(f"_token = self.{token_getter}()")
                else:
                    writer.write_line(f"_token = self.{token_getter}()")
                writer.write_line("if _token is not None:")
                with writer.indent():
                    for key, token_header, token_prefix in token_schemes:
                        token_value = self._get_prefixed_header_value(
                            token_prefix,
                            "_token",
                            raw_value_for_empty_prefix=True,
                        )
                        writer.write_line(
                            f"{available_var}[{json.dumps(key)}] = {{{json.dumps(token_header)}: {token_value}}}"
                        )

            # Header auth schemes (e.g. X-API-Key)
            for header_auth_scheme in header_auth_schemes:
                member = names.get_auth_scheme_header_private_member_name(header_auth_scheme)
                header_key = get_wire_value(header_auth_scheme.name)
                writer.write_line(f"if self.{member} is not None:")
                with writer.indent():
                    if header_auth_scheme.prefix is not None:
                        value = f'f"{header_auth_scheme.prefix} {{self.{member}}}"'
                    else:
                        value = f"self.{member}"
                    writer.write_line(f'{available_var}["{header_auth_scheme.key}"] = {{"{header_key}": {value}}}')

            # Basic auth
            if basic_auth_scheme is not None:
                username_omitted = basic_auth_scheme.username_omit is True
                password_omitted = basic_auth_scheme.password_omit is True
                if not (username_omitted and password_omitted):
                    conditions: List[str] = []
                    if not username_omitted:
                        writer.write_line(f"_username = self.{names.get_username_getter_name(basic_auth_scheme)}()")
                        conditions.append("_username is not None")
                    if not password_omitted:
                        writer.write_line(f"_password = self.{names.get_password_getter_name(basic_auth_scheme)}()")
                        conditions.append("_password is not None")
                    username_arg = AST.Expression('""') if username_omitted else AST.Expression("_username")
                    password_arg = AST.Expression('""') if password_omitted else AST.Expression("_password")
                    writer.write_line(f"if {' and '.join(conditions)}:")
                    with writer.indent():
                        writer.write(
                            f'{available_var}["{basic_auth_scheme.key}"] = {{"{ClientWrapperGenerator.AUTHORIZATION_HEADER}": '
                        )
                        writer.write_node(
                            AST.ClassInstantiation(
                                class_=httpx.HttpX.BASIC_AUTH,
                                args=[username_arg, password_arg],
                            )
                        )
                        writer.write("._auth_header}")
                        writer.write_newline_if_last_line_not()

            # Inferred auth
            if inferred_auth_scheme is not None:
                if is_async:
                    writer.write_line(f"if self.{ClientWrapperGenerator.ASYNC_AUTH_HEADERS_MEMBER_NAME} is not None:")
                    with writer.indent():
                        writer.write_line(
                            f'{available_var}["{inferred_auth_scheme.key}"] = dict(await self.{ClientWrapperGenerator.ASYNC_AUTH_HEADERS_MEMBER_NAME}())'
                        )
                    writer.write_line(f"elif self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME} is not None:")
                    with writer.indent():
                        writer.write_line(
                            f'{available_var}["{inferred_auth_scheme.key}"] = dict(self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME}())'
                        )
                else:
                    writer.write_line(f"if self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME} is not None:")
                    with writer.indent():
                        writer.write_line(
                            f'{available_var}["{inferred_auth_scheme.key}"] = dict(self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME}())'
                        )

            # OR across requirements: pick the first fully-satisfiable requirement.
            writer.write_line(f"for requirement in {security_param}:")
            with writer.indent():
                writer.write_line(f"if all(scheme_key in {available_var} for scheme_key in requirement):")
                with writer.indent():
                    writer.write("combined_headers: ")
                    writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()))
                    writer.write_line(" = {}")
                    writer.write_line("for scheme_key in requirement:")
                    with writer.indent():
                        writer.write_line(f"combined_headers.update({available_var}[scheme_key])")
                    writer.write_line("return combined_headers")

            # No requirement satisfiable: raise naming the missing schemes.
            writer.write_line(
                f'_missing_hints = " OR ".join(" AND ".join(scheme_key for scheme_key in requirement if scheme_key not in {available_var}) for requirement in {security_param})'
            )
            writer.write_line("raise ValueError(")
            with writer.indent():
                writer.write_line(
                    '"No authentication credentials provided that satisfy the endpoint\'s security requirements. "'
                )
                writer.write_line('"Please provide credentials for: " + _missing_hints')
            writer.write_line(")")

        return _write_auth_headers_for_endpoint_body

    def _has_bearer_scheme(self) -> bool:
        for scheme in self._context.ir.auth.schemes:
            if scheme.get_as_union().type == "bearer":
                return True
        return False

    def _get_write_async_client_wrapper_constructor_body(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
    ) -> CodeWriterFunction:
        has_base_url = get_client_wrapper_url_type(ir=self._context.ir) == ClientWrapperUrlStorage.URL

        def _write_async_client_wrapper_constructor_body(
            writer: AST.NodeWriter,
        ) -> None:
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
            # Store async_token
            writer.write_line(
                f"self.{ClientWrapperGenerator.ASYNC_TOKEN_MEMBER_NAME} = {ClientWrapperGenerator.ASYNC_TOKEN_PARAMETER_NAME}"
            )
            if self._has_inferred_auth():
                writer.write_line(
                    f"self.{ClientWrapperGenerator.ASYNC_AUTH_HEADERS_MEMBER_NAME} = {ClientWrapperGenerator.ASYNC_AUTH_HEADERS_CONSTRUCTOR_PARAMETER_NAME}"
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
                    is_async=True,
                    base_max_retries=AST.Expression(f"self.{ClientWrapperGenerator.GET_MAX_RETRIES_METHOD_NAME}()"),
                    async_base_headers=AST.Expression(f"self.{ClientWrapperGenerator.ASYNC_GET_HEADERS_METHOD_NAME}"),
                    logging_config=AST.Expression(f"self.{ClientWrapperGenerator.LOGGING_MEMBER_NAME}"),
                )
            )

        return _write_async_client_wrapper_constructor_body

    def _get_write_derived_client_wrapper_constructor_body(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
        is_async: bool,
    ) -> CodeWriterFunction:
        has_base_url = get_client_wrapper_url_type(ir=self._context.ir) == ClientWrapperUrlStorage.URL

        def _write_derived_client_wrapper_constructor_body(
            writer: AST.NodeWriter,
        ) -> None:
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
                    base_max_retries=AST.Expression(f"self.{ClientWrapperGenerator.GET_MAX_RETRIES_METHOD_NAME}()"),
                    logging_config=AST.Expression(f"self.{ClientWrapperGenerator.LOGGING_MEMBER_NAME}"),
                )
            )

        return _write_derived_client_wrapper_constructor_body

    def _get_named_parameters(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
    ) -> typing.List[AST.NamedFunctionParameter]:
        return [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=(
                    param.initializer
                    if param.constructor_parameter_name == ClientWrapperGenerator.MAX_RETRIES_PARAMETER_NAME
                    else None
                ),
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
            omit_fern_headers = self._context.custom_config.omit_fern_headers
            include_platform_headers = self._context.custom_config.include_platform_headers
            allow_user_agent_app_info = self._context.custom_config.allow_user_agent_app_info
            user_agent_header = self._context.ir.sdk_config.platform_headers.user_agent

            def _with_app_info(user_agent_expr: str) -> str:
                # When the opt-in `allow_user_agent_app_info` config is set, the caller's
                # `app_info` product token is appended to whichever User-Agent value the
                # SDK would otherwise send, via the self-contained helper emitted into
                # this module. Byte-identical to the unwrapped expression when disabled.
                if not allow_user_agent_app_info:
                    return user_agent_expr
                return (
                    f"{ClientWrapperGenerator.APPEND_APP_INFO_HELPER_NAME}"
                    f"({user_agent_expr}, self.{ClientWrapperGenerator.APP_INFO_MEMBER_NAME})"
                )

            # When runtime_version is enabled we resolve the SDK version at runtime via
            # importlib.metadata (see the `_sdk_version` block emitted below) instead of
            # baking the generation-time literal, so the reported version tracks the
            # actually-installed package version. Requires a known distribution name.
            runtime_version_active = self._context.custom_config.runtime_version and project._project_config is not None

            # When include_platform_headers is enabled we emit a single structured
            # `User-Agent` (`{sdkName}/{version} ({os}; {arch}) Python/{version}`)
            # that supersedes the default `{package}/{version}` User-Agent and the
            # discrete X-Fern-Runtime / X-Fern-Platform headers. The value is computed
            # at runtime so the platform/runtime segments reflect the execution env.
            # When it is disabled (default), the discrete headers are preserved.
            # The IR value already reflects the resolved `user-agent` template when one is
            # configured, so it takes precedence over the package coordinate.
            user_agent_prefix: typing.Optional[str] = None
            if user_agent_header is not None:
                user_agent_prefix = user_agent_header.value
            elif project._project_config is not None:
                user_agent_prefix = f"{project._project_config.package_name}/{project._project_config.package_version}"
            emit_structured_user_agent = (
                include_platform_headers and not omit_fern_headers and user_agent_prefix is not None
            )
            # Everything up to and including the version separator, so a runtime-resolved
            # version can be appended in place of the baked-in one.
            user_agent_coordinate_prefix = (
                _get_user_agent_coordinate_prefix(user_agent_prefix) if user_agent_prefix is not None else None
            )

            if not omit_fern_headers:
                writer.write_line("import platform")
                writer.write_line("")
                if runtime_version_active and project._project_config is not None:
                    # Resolve the installed distribution version at runtime; fall back to
                    # the generation-time version when the package is not installed
                    # (e.g. running from source).
                    writer.write_line("from importlib import metadata as _fern_importlib_metadata")
                    writer.write_line("try:")
                    with writer.indent():
                        writer.write_line(
                            f'_sdk_version = _fern_importlib_metadata.version("{project._project_config.package_name}")'
                        )
                    writer.write_line("except _fern_importlib_metadata.PackageNotFoundError:")
                    with writer.indent():
                        writer.write_line(f'_sdk_version = "{project._project_config.package_version}"')
                    writer.write_line("")
                if emit_structured_user_agent:
                    if runtime_version_active and user_agent_coordinate_prefix is not None:
                        writer.write_line(f'_user_agent = "{user_agent_coordinate_prefix}" + _sdk_version')
                    else:
                        writer.write_line(f'_user_agent = "{user_agent_prefix}"')
                    writer.write_line("_os = platform.system().lower()")
                    # Collapse the 64-bit x86 aliases (x64, amd64, x86_64) to the canonical x86_64.
                    writer.write_line("_arch = platform.machine()")
                    writer.write_line('if _arch.lower() in ("x64", "amd64", "x86_64"):')
                    with writer.indent():
                        writer.write_line('_arch = "x86_64"')
                    writer.write_line('_platform = "; ".join(part for part in (_os, _arch) if part)')
                    writer.write_line("if _platform:")
                    with writer.indent():
                        writer.write_line('_user_agent += f" ({_platform})"')
                    writer.write_line("_python_version = platform.python_version()")
                    writer.write_line("if _python_version:")
                    with writer.indent():
                        writer.write_line('_user_agent += f" Python/{_python_version}"')
                    if allow_user_agent_app_info:
                        writer.write_line(f"_user_agent = {_with_app_info('_user_agent')}")
            writer.write("headers: ")
            writer.write_node(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()))
            writer.write_line("= {")
            if not omit_fern_headers:
                if emit_structured_user_agent:
                    writer.write_line('"User-Agent": _user_agent,')
                elif user_agent_header is not None:
                    if runtime_version_active and user_agent_coordinate_prefix is not None:
                        user_agent_value_expr = f'"{user_agent_coordinate_prefix}" + _sdk_version'
                    else:
                        user_agent_value_expr = f'"{user_agent_header.value}"'
                    writer.write_line(f'"{user_agent_header.header}": {_with_app_info(user_agent_value_expr)},')
                elif allow_user_agent_app_info and project._project_config is not None:
                    # No structured or templated User-Agent is configured, but app-info was
                    # opted into: emit the default `{package}/{version}` User-Agent so the
                    # caller's product token has a base to append to. Only emitted when the
                    # flag is on, keeping default output byte-identical.
                    if runtime_version_active:
                        default_user_agent_expr = f'"{project._project_config.package_name}/" + _sdk_version'
                    else:
                        default_user_agent_expr = (
                            f'"{project._project_config.package_name}/{project._project_config.package_version}"'
                        )
                    writer.write_line(f'"User-Agent": {_with_app_info(default_user_agent_expr)},')
                writer.write_line(f'"{self._context.ir.sdk_config.platform_headers.language}": "Python",')
                if not emit_structured_user_agent:
                    writer.write_line("f'X-Fern-Runtime': f\"python/{platform.python_version()}\",")
                    writer.write_line("f'X-Fern-Platform': f\"{platform.system().lower()}/{platform.release()}\",")
                if project._project_config is not None:
                    writer.write_line(
                        f'"{self._context.ir.sdk_config.platform_headers.sdk_name}": "{project._project_config.package_name}",'
                    )
                    if runtime_version_active:
                        writer.write_line(
                            f'"{self._context.ir.sdk_config.platform_headers.sdk_version}": _sdk_version,'
                        )
                    else:
                        writer.write_line(
                            f'"{self._context.ir.sdk_config.platform_headers.sdk_version}": "{project._project_config.package_version}",'
                        )
            writer.write_line("**(self.get_custom_headers() or {}),")
            writer.write_line("}")
            writer.write_newline_if_last_line_not()
            # In endpoint-security mode, auth headers are routed per-endpoint via
            # get_auth_headers_for_endpoint, so the flat get_headers() must not emit
            # any auth headers (it is applied as base_headers to every request).
            emit_flat_auth = not self.is_endpoint_security()
            basic_auth_scheme = self._get_basic_auth_scheme()
            if basic_auth_scheme is not None and emit_flat_auth:
                username_omitted = basic_auth_scheme.username_omit is True
                password_omitted = basic_auth_scheme.password_omit is True

                if not self._context.ir.sdk_config.is_auth_mandatory or self._context.custom_config.optional_auth:
                    # Build condition and args based on which fields are omitted vs present
                    conditions = []
                    if not username_omitted:
                        username_var = names.get_username_constructor_parameter_name(basic_auth_scheme)
                        writer.write_line(
                            f"{username_var} = self.{names.get_username_getter_name(basic_auth_scheme)}()"
                        )
                        conditions.append(f"{username_var} is not None")
                    if not password_omitted:
                        password_var = names.get_password_constructor_parameter_name(basic_auth_scheme)
                        writer.write_line(
                            f"{password_var} = self.{names.get_password_getter_name(basic_auth_scheme)}()"
                        )
                        conditions.append(f"{password_var} is not None")

                    # Omitted fields use empty string directly
                    username_arg = AST.Expression('""') if username_omitted else AST.Expression(username_var)
                    password_arg = AST.Expression('""') if password_omitted else AST.Expression(password_var)

                    if conditions:
                        writer.write_line(f"if {' and '.join(conditions)}:")
                        with writer.indent():
                            writer.write(f'headers["{ClientWrapperGenerator.AUTHORIZATION_HEADER}"] = ')
                            writer.write_node(
                                AST.ClassInstantiation(
                                    class_=httpx.HttpX.BASIC_AUTH,
                                    args=[username_arg, password_arg],
                                )
                            )
                            writer.write("._auth_header")
                            writer.write_newline_if_last_line_not()
                    else:
                        # Both fields omitted and auth is non-mandatory - skip header entirely
                        pass
                else:
                    # Auth is mandatory - omitted fields use empty string
                    if username_omitted and password_omitted:
                        # Both fields omitted - skip header entirely
                        pass
                    else:
                        username_getter = (
                            '""' if username_omitted else f"self.{names.get_username_getter_name(basic_auth_scheme)}()"
                        )
                        password_getter = (
                            '""' if password_omitted else f"self.{names.get_password_getter_name(basic_auth_scheme)}()"
                        )
                        writer.write(f'headers["{ClientWrapperGenerator.AUTHORIZATION_HEADER}"] = ')
                        writer.write_node(
                            AST.ClassInstantiation(
                                class_=httpx.HttpX.BASIC_AUTH,
                                args=[
                                    AST.Expression(username_getter),
                                    AST.Expression(password_getter),
                                ],
                            )
                        )
                        writer.write("._auth_header")
                        writer.write_newline_if_last_line_not()
            for param in constructor_parameters:
                if param.is_basic:
                    continue
                if param.is_auth and not emit_flat_auth:
                    continue
                if param.header_key is not None:
                    header_key = json.dumps(param.header_key)
                    if param.header_prefix is not None:
                        if param.getter_method is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(
                                    f"{param.constructor_parameter_name} = self.{param.getter_method.name}()"
                                )
                                writer.write_line(f"if {param.constructor_parameter_name} is not None:")
                                with writer.indent():
                                    writer.write_line(
                                        f"headers[{header_key}] = "
                                        + self._get_prefixed_header_value(
                                            param.header_prefix,
                                            param.constructor_parameter_name,
                                            raw_value_for_empty_prefix=param.raw_header_value_for_empty_prefix,
                                        )
                                    )
                            else:
                                writer.write_line(
                                    f"headers[{header_key}] = "
                                    + self._get_prefixed_header_value(
                                        param.header_prefix,
                                        f"self.{param.getter_method.name}()",
                                        raw_value_for_empty_prefix=param.raw_header_value_for_empty_prefix,
                                    )
                                )
                        elif param.private_member_name is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(f"if self.{param.private_member_name} is not None:")
                                writer.indent()
                            writer.write_line(
                                f"headers[{header_key}] = "
                                + self._get_prefixed_header_value(
                                    param.header_prefix,
                                    f"self.{param.private_member_name}",
                                    raw_value_for_empty_prefix=param.raw_header_value_for_empty_prefix,
                                )
                            )
                            if param.type_hint.is_optional:
                                writer.outdent()
                    else:
                        stringify = (lambda expr: f"str({expr})") if param.needs_str_conversion else (lambda expr: expr)
                        if param.getter_method is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(
                                    f"{param.constructor_parameter_name} = self.{param.getter_method.name}()"
                                )
                                writer.write_line(f"if {param.constructor_parameter_name} is not None:")
                                with writer.indent():
                                    writer.write_line(
                                        f"headers[{header_key}] = {stringify(param.constructor_parameter_name)}"
                                    )
                            else:
                                writer.write_line(
                                    f"headers[{header_key}] = {stringify(f'self.{param.getter_method.name}()')}"
                                )
                        elif param.private_member_name is not None:
                            if param.type_hint.is_optional:
                                writer.write_line(f"if self.{param.private_member_name} is not None:")
                                writer.indent()
                            writer.write_line(
                                f"headers[{header_key}] = {stringify(f'self.{param.private_member_name}')}"
                            )
                            if param.type_hint.is_optional:
                                writer.outdent()
            for literal_header in literal_headers:
                private_member_name = literal_header.private_member_name
                writer.write(
                    f'headers["{literal_header.header_key}"] = self.{private_member_name} if self.{private_member_name} is not None else "{self._context.get_literal_header_value(literal_header.header)}"'
                )
                writer.write_line()
            if self._has_inferred_auth() and emit_flat_auth:
                writer.write_line(f"if self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME} is not None:")
                with writer.indent():
                    writer.write_line(f"headers.update(self.{ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME}())")
            writer.write_line("return headers")

        return _write_get_headers_body

    def _get_write_constructor_body(
        self,
        *,
        constructor_parameters: List[ConstructorParameter],
        literal_headers: List[LiteralHeader],
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

        # Opt-in `app_info` parameter. Its product token is appended to whatever
        # User-Agent the SDK would otherwise send (see `_get_write_get_headers_body`).
        # Only surfaced when the `allow_user_agent_app_info` config is enabled, so
        # default output stays byte-identical.
        app_info_constructor_parameter = (
            ConstructorParameter(
                constructor_parameter_name=ClientWrapperGenerator.APP_INFO_PARAMETER_NAME,
                type_hint=AST.TypeHint.optional(AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_())),
                private_member_name=ClientWrapperGenerator.APP_INFO_MEMBER_NAME,
                docs=(
                    "Application identification appended to the User-Agent header as a product token, "
                    'e.g. `{"name": "partner-app", "version": "3.1.0", "comment": "+https://partner.example"}`. '
                    "`name` is required; `version` and `comment` are optional."
                ),
            )
            if self._context.custom_config.allow_user_agent_app_info
            else None
        )

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
                        f'{constructor_parameter_name}="YOUR_{resolve_name(variable.name).screaming_snake_case.safe_name}"'
                    ),
                    docs=variable.docs,
                )
            )

        for root_path_parameter in self._context.ir.path_parameters:
            if root_path_parameter.location != ir_types.PathParameterLocation.ROOT:
                continue
            path_param_type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                root_path_parameter.value_type
            )
            constructor_parameter_name = names.get_root_path_parameter_constructor_parameter_name(root_path_parameter)
            client_default_initializer = self._get_client_default_initializer(root_path_parameter.client_default)
            if client_default_initializer is not None and not path_param_type_hint.is_optional:
                path_param_type_hint = AST.TypeHint.optional(path_param_type_hint)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_root_path_parameter_member_name(root_path_parameter),
                    type_hint=path_param_type_hint,
                    initializer=(
                        client_default_initializer
                        if client_default_initializer is not None
                        else AST.Expression(
                            f'{constructor_parameter_name}="YOUR_{resolve_name(root_path_parameter.name).screaming_snake_case.safe_name}"',
                        )
                    ),
                    client_default=client_default_initializer,
                    docs=root_path_parameter.docs,
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
                        header_key=get_wire_value(header.name),
                    )
                )
                continue
            constructor_parameter_name = names.get_header_constructor_parameter_name(header)
            client_default_initializer = self._get_client_default_initializer(header.client_default)
            needs_str_conversion = not is_type_reference_string(
                header.value_type,
                self._context.pydantic_generator_context.get_declaration_for_type_id,
            )
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_header_private_member_name(header),
                    type_hint=type_hint,
                    initializer=(
                        client_default_initializer
                        if client_default_initializer is not None
                        else AST.Expression(
                            f'{constructor_parameter_name}="YOUR_{resolve_name(get_name_from_wire_value(header.name)).screaming_snake_case.safe_name}"',
                        )
                    ),
                    header_key=get_wire_value(header.name),
                    environment_variable=header.env,
                    client_default=client_default_initializer,
                    needs_str_conversion=needs_str_conversion,
                )
            )

        # Header auth schemes (e.g. X-API-Key) are independent of bearer/basic/OAuth auth
        # and must always be included — even when exclude_auth is True (OAuth token override mode).
        # When OAuth is also present (auth: any), make them optional so users can authenticate
        # with either OAuth or the header auth scheme alone.
        # TODO(dsinghvi): Support suppliers for header auth schemes
        for header_auth_scheme in self._get_header_auth_schemes():
            constructor_parameter_name = names.get_auth_scheme_header_constructor_parameter_name(header_auth_scheme)
            type_hint = self._context.pydantic_generator_context.get_type_hint_for_type_reference(
                header_auth_scheme.value_type
            )
            if (self._has_oauth() or self._context.custom_config.optional_auth) and not type_hint.is_optional:
                type_hint = AST.TypeHint.optional(type_hint)
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_auth_scheme_header_private_member_name(header_auth_scheme),
                    type_hint=type_hint,
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{resolve_name(get_name_from_wire_value(header_auth_scheme.name)).screaming_snake_case.safe_name}"',
                    ),
                    header_key=get_wire_value(header_auth_scheme.name),
                    header_prefix=header_auth_scheme.prefix,
                    environment_variable=(
                        header_auth_scheme.header_env_var if header_auth_scheme.header_env_var is not None else None
                    ),
                    is_auth=True,
                )
            )

        # Basic auth is independent of bearer/OAuth auth and must always be included —
        # even when exclude_auth is True (OAuth token override mode). When OAuth is also
        # present (auth: any), make the credentials optional so users can authenticate
        # with either OAuth or basic auth alone.
        basic_auth_scheme = self._get_basic_auth_scheme()
        basic_auth_is_required = (
            self._context.ir.sdk_config.is_auth_mandatory
            and not self._has_oauth()
            and not self._context.custom_config.optional_auth
        )
        if basic_auth_scheme is not None:
            username_omitted = basic_auth_scheme.username_omit is True
            password_omitted = basic_auth_scheme.password_omit is True

            # When omit is true, the field is completely removed from the end-user API.
            # Only add non-omitted fields to constructor parameters.
            if not username_omitted:
                username_constructor_parameter_name = names.get_username_constructor_parameter_name(basic_auth_scheme)
                username_constructor_parameter = ConstructorParameter(
                    constructor_parameter_name=username_constructor_parameter_name,
                    private_member_name=names.get_username_member_name(basic_auth_scheme),
                    type_hint=(
                        ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                        if basic_auth_is_required
                        else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                    ),
                    initializer=AST.Expression(
                        f'{username_constructor_parameter_name}="YOUR_{resolve_name(basic_auth_scheme.username).screaming_snake_case.safe_name}"',
                    ),
                    getter_method=AST.FunctionDeclaration(
                        name=names.get_username_getter_name(basic_auth_scheme),
                        signature=AST.FunctionSignature(
                            parameters=[],
                            return_type=(
                                AST.TypeHint.str_()
                                if basic_auth_is_required
                                else AST.TypeHint.optional(AST.TypeHint.str_())
                            ),
                        ),
                        body=AST.CodeWriter(
                            self._get_required_getter_body_writer(
                                member_name=names.get_username_member_name(basic_auth_scheme)
                            )
                            if basic_auth_is_required
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
                parameters.append(username_constructor_parameter)

            if not password_omitted:
                password_constructor_parameter_name = names.get_password_constructor_parameter_name(basic_auth_scheme)
                password_constructor_parameter = ConstructorParameter(
                    constructor_parameter_name=password_constructor_parameter_name,
                    private_member_name=names.get_password_member_name(basic_auth_scheme),
                    type_hint=(
                        ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                        if basic_auth_is_required
                        else AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                    ),
                    initializer=AST.Expression(
                        f'{password_constructor_parameter_name}="YOUR_{resolve_name(basic_auth_scheme.password).screaming_snake_case.safe_name}"',
                    ),
                    getter_method=AST.FunctionDeclaration(
                        name=names.get_password_getter_name(basic_auth_scheme),
                        signature=AST.FunctionSignature(
                            parameters=[],
                            return_type=(
                                AST.TypeHint.str_()
                                if basic_auth_is_required
                                else AST.TypeHint.optional(AST.TypeHint.str_())
                            ),
                        ),
                        body=AST.CodeWriter(
                            self._get_required_getter_body_writer(
                                member_name=names.get_password_member_name(basic_auth_scheme)
                            )
                            if basic_auth_is_required
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
                parameters.append(password_constructor_parameter)

        if exclude_auth:
            # Add generic headers parameter even when excluding auth
            parameters.append(headers_constructor_parameter)
            if app_info_constructor_parameter is not None:
                parameters.append(app_info_constructor_parameter)
            return ConstructorInfo(
                constructor_parameters=parameters,
                literal_headers=literal_headers,
            )

        if self._has_inferred_auth():
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=ClientWrapperGenerator.AUTH_HEADERS_CONSTRUCTOR_PARAMETER_NAME,
                    type_hint=AST.TypeHint.optional(
                        AST.TypeHint.callable(
                            parameters=[],
                            return_type=AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.str_()),
                        )
                    ),
                    private_member_name=ClientWrapperGenerator.AUTH_HEADERS_MEMBER_NAME,
                    initializer=AST.Expression(AST.TypeHint.none()),
                    docs="A callable that returns auth headers to send with every request. Used for inferred authentication.",
                )
            )

        bearer_auth_scheme = self._get_bearer_auth_scheme()
        if bearer_auth_scheme is not None:
            token_header, token_prefix = self._get_token_header_and_prefix()
            constructor_parameter_name = names.get_token_constructor_parameter_name(bearer_auth_scheme)
            # For OAuth flows, the OAuthTokenProvider needs to create a SyncClientWrapper without a token
            # to fetch the initial token. For plain bearer auth, use the is_auth_mandatory flag.
            # This matches TypeScript's behavior where the auth client doesn't require a token.
            is_token_optional = (
                self._has_oauth()
                or not self._context.ir.sdk_config.is_auth_mandatory
                or self._context.custom_config.optional_auth
            )
            parameters.append(
                ConstructorParameter(
                    constructor_parameter_name=constructor_parameter_name,
                    private_member_name=names.get_token_member_name(bearer_auth_scheme),
                    type_hint=(
                        AST.TypeHint.optional(ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT)
                        if is_token_optional
                        else ClientWrapperGenerator.STRING_OR_SUPPLIER_TYPE_HINT
                    ),
                    initializer=AST.Expression(
                        f'{constructor_parameter_name}="YOUR_{resolve_name(bearer_auth_scheme.token).screaming_snake_case.safe_name}"',
                    ),
                    getter_method=AST.FunctionDeclaration(
                        name=names.get_token_getter_name(bearer_auth_scheme),
                        signature=AST.FunctionSignature(
                            parameters=[],
                            return_type=(
                                AST.TypeHint.optional(AST.TypeHint.str_()) if is_token_optional else AST.TypeHint.str_()
                            ),
                        ),
                        body=AST.CodeWriter(
                            self._get_optional_getter_body_writer(
                                member_name=names.get_token_member_name(bearer_auth_scheme)
                            )
                            if is_token_optional
                            else self._get_required_getter_body_writer(
                                member_name=names.get_token_member_name(bearer_auth_scheme)
                            )
                        ),
                    ),
                    header_key=token_header,
                    header_prefix=token_prefix,
                    is_auth=True,
                    raw_header_value_for_empty_prefix=self._has_oauth(),
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

        # Add generic headers parameter
        parameters.append(headers_constructor_parameter)
        if app_info_constructor_parameter is not None:
            parameters.append(app_info_constructor_parameter)

        return ConstructorInfo(
            constructor_parameters=parameters,
            literal_headers=literal_headers,
        )

    def _get_client_default_initializer(
        self, client_default: typing.Optional[ir_types.Literal]
    ) -> typing.Optional[AST.Expression]:
        if client_default is None:
            return None
        return client_default.visit(
            string=lambda value: AST.Expression(repr(value)),
            boolean=lambda value: AST.Expression(f"{value}"),
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

    def is_endpoint_security(self) -> bool:
        """Whether the API applies auth per-endpoint (each endpoint declares its own schemes)."""
        return self._context.ir.auth.requirement == ir_types.AuthSchemesRequirement.ENDPOINT_SECURITY

    def _get_oauth_scheme(self) -> Optional[ir_types.OAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "oauth":
                return scheme_as_union
        return None

    def _get_token_header_and_prefix(self) -> typing.Tuple[str, str]:
        if self._has_bearer_scheme():
            return (
                ClientWrapperGenerator.AUTHORIZATION_HEADER,
                ClientWrapperGenerator.BEARER_AUTH_PREFIX,
            )
        return self._get_oauth_token_header_and_prefix()

    def _get_oauth_token_header_and_prefix(self) -> typing.Tuple[str, str]:
        oauth_scheme = self._get_oauth_scheme()
        if oauth_scheme is None:
            return (
                ClientWrapperGenerator.AUTHORIZATION_HEADER,
                ClientWrapperGenerator.BEARER_AUTH_PREFIX,
            )

        oauth_configuration = oauth_scheme.configuration.get_as_union()
        if oauth_configuration.type != "clientCredentials":
            return (
                ClientWrapperGenerator.AUTHORIZATION_HEADER,
                ClientWrapperGenerator.BEARER_AUTH_PREFIX,
            )

        token_header = (
            oauth_configuration.token_header
            if oauth_configuration.token_header is not None
            else ClientWrapperGenerator.AUTHORIZATION_HEADER
        )
        token_prefix = (
            oauth_configuration.token_prefix
            if oauth_configuration.token_prefix is not None
            else ClientWrapperGenerator.BEARER_AUTH_PREFIX
        )
        return token_header, token_prefix

    @staticmethod
    def _get_prefixed_header_value(
        prefix: str,
        value_expression: str,
        *,
        raw_value_for_empty_prefix: bool = False,
    ) -> str:
        if len(prefix) == 0:
            return value_expression if raw_value_for_empty_prefix else f'f" {{{value_expression}}}"'
        if re.search(r'[\\"\r\n{}]', prefix) is not None:
            return f"{(prefix + ' ')!r} + {value_expression}"
        return f'f"{prefix} {{{value_expression}}}"'

    def _get_inferred_auth_scheme(self) -> Optional[ir_types.InferredAuthScheme]:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "inferred":
                return scheme_as_union
        return None

    def _has_oauth(self) -> bool:
        """Check if the API uses OAuth authentication."""
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "oauth":
                return True
        return False

    def _has_inferred_auth(self) -> bool:
        for scheme in self._context.ir.auth.schemes:
            scheme_as_union = scheme.get_as_union()
            if scheme_as_union.type == "inferred":
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
