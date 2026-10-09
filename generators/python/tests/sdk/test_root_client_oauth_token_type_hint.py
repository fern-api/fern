from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.generators.sdk.client_generator.root_client_generator import (
    RootClientGenerator,
)
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.source_file_factory import SourceFileFactory


class _FakeIr:
    def __init__(self, *, auth: ir_types.ApiAuth, sdk_config: ir_types.SdkConfig) -> None:
        self.auth = auth
        self.sdk_config = sdk_config
        self.environments = None
        self.variables: List[ir_types.VariableDeclaration] = []
        self.headers: List[ir_types.HttpHeader] = []
        self.path_parameters: List[ir_types.PathParameter] = []


class _FakeCoreUtilities:
    def _reference(self, name: str) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(name,),
            import_=AST.ReferenceImport(module=AST.Module.snippet(module_path=("acme", "core"))),
        )

    def get_reference_to_log_config(self) -> AST.ClassReference:
        return self._reference("LogConfig")

    def get_reference_to_logger(self) -> AST.ClassReference:
        return self._reference("Logger")


class _FakeContext:
    def __init__(self, *, ir: _FakeIr, custom_config: SDKCustomConfig) -> None:
        self.ir = ir
        self.custom_config = custom_config
        self.source_file_factory = SourceFileFactory(should_format=False)
        self.core_utilities = _FakeCoreUtilities()


def _oauth_scheme() -> ir_types.OAuthScheme:
    return ir_types.OAuthScheme(
        key="oauth",
        configuration=ir_types.OAuthConfiguration.factory.client_credentials(
            ir_types.OAuthClientCredentials(
                client_id_env_var=None,
                client_secret_env_var=None,
                token_prefix=None,
                scopes=None,
                token_endpoint=ir_types.OAuthTokenEndpoint(
                    endpoint_reference=ir_types.EndpointReference(
                        subpackage_id=None,
                        service_id="service_auth",
                        endpoint_id="endpoint_auth.getToken",
                    ),
                    request_properties=ir_types.OAuthAccessTokenRequestProperties(
                        client_id=_body_request_property("client_id"),
                        client_secret=_body_request_property("client_secret"),
                        scopes=None,
                        custom_properties=None,
                    ),
                    response_properties=ir_types.OAuthAccessTokenResponseProperties(
                        access_token=_response_property("access_token"),
                        expires_in=None,
                        refresh_token=None,
                    ),
                ),
                refresh_endpoint=None,
            )
        ),
    )


def _name(value: str) -> ir_types.Name:
    return ir_types.Name(
        original_name=value,
        camel_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        pascal_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        snake_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        screaming_snake_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
    )


def _body_request_property(value: str) -> ir_types.RequestProperty:
    return ir_types.RequestProperty(
        property_path=None,
        property=ir_types.RequestPropertyValue.factory.body(
            ir_types.ObjectProperty(
                name=ir_types.NameAndWireValue(wire_value=value, name=_name(value)),
                value_type=ir_types.TypeReference.factory.primitive(
                    ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
                ),
            )
        ),
    )


def _response_property(value: str) -> ir_types.ResponseProperty:
    return ir_types.ResponseProperty(
        property_path=None,
        property=ir_types.ObjectProperty(
            name=ir_types.NameAndWireValue(wire_value=value, name=_name(value)),
            value_type=ir_types.TypeReference.factory.primitive(
                ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
            ),
        ),
    )


def _create_generator() -> RootClientGenerator:
    """Builds a generator wired to an OAuth client-credentials scheme, bypassing __init__'s
    dependency on a full SdkGeneratorContext."""
    generator = RootClientGenerator.__new__(RootClientGenerator)
    generator._oauth_scheme = _oauth_scheme()
    generator._generated_environment = None
    generator._environments_config = None
    generator._timeout_constructor_parameter_name = "timeout"
    generator._max_retries_constructor_parameter_name = "max_retries"
    generator._context = _FakeContext(  # type: ignore[assignment]
        ir=_FakeIr(
            auth=ir_types.ApiAuth(
                requirement=ir_types.AuthSchemesRequirement.ALL,
                schemes=[ir_types.AuthScheme.factory.oauth(generator._oauth_scheme)],
            ),
            sdk_config=ir_types.SdkConfig(
                is_auth_mandatory=True,
                has_streaming_endpoints=False,
                has_paginated_endpoints=False,
                has_file_download_endpoints=False,
                platform_headers=ir_types.PlatformHeaders(
                    language="X-Fern-Language",
                    sdk_name="X-Fern-SDK-Name",
                    sdk_version="X-Fern-SDK-Version",
                ),
            ),
        ),
        custom_config=SDKCustomConfig.parse_obj({}),
    )
    return generator


def _render(type_hint: Optional[AST.TypeHint]) -> str:
    assert type_hint is not None
    snippet = SourceFileFactory(should_format=False).create_snippet()
    snippet.add_expression(AST.Expression(type_hint))
    # the snippet renders its imports above the expression
    return snippet.to_str().strip().splitlines()[-1].strip()


_STRING_OR_SUPPLIER = "typing.Union[str, typing.Callable[[], str]]"


def test_oauth_token_overload_accepts_a_string() -> None:
    """The direct-token overload must accept the string the generated docstring example passes."""
    overloads = _create_generator()._get_constructor_overloads(is_async=False)
    assert overloads is not None
    token_overload = overloads[-1]
    token_param = next(
        param for param in token_overload.named_parameters if param.name == RootClientGenerator.TOKEN_PARAMETER_NAME
    )
    assert _render(token_param.type_hint) == _STRING_OR_SUPPLIER


def test_oauth_token_constructor_parameter_accepts_a_string() -> None:
    parameters = _create_generator()._get_constructor_parameters(is_async=False)
    token_param = next(
        param for param in parameters if param.constructor_parameter_name == RootClientGenerator.TOKEN_PARAMETER_NAME
    )
    assert _render(token_param.type_hint) == f"typing.Optional[{_STRING_OR_SUPPLIER}]"


def test_oauth_token_docstring_documents_the_string_it_shows_in_the_example() -> None:
    """The class docstring's Parameters section must agree with the constructor signature."""
    snippet = SourceFileFactory(should_format=False).create_snippet()
    snippet.add_arbitrary_code(
        AST.CodeWriter(lambda writer: _create_generator()._write_root_class_docstring(writer, is_async=False))
    )
    assert f"{RootClientGenerator.TOKEN_PARAMETER_NAME} : {_STRING_OR_SUPPLIER}" in snippet.to_str()


def test_oauth_token_getter_override_stays_callable_only() -> None:
    """The private token getter is invoked by the generated code, so it must remain a callable."""
    parameters = _create_generator()._get_constructor_parameters(is_async=False)
    token_getter_param = next(
        param for param in parameters if param.constructor_parameter_name == RootClientGenerator.TOKEN_GETTER_PARAM_NAME
    )
    assert _render(token_getter_param.type_hint) == "typing.Optional[typing.Callable[[], str]]"
