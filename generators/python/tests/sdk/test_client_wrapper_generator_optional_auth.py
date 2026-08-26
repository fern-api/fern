import re
from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
    ConstructorParameter,
)
from fern_python.generators.sdk.custom_config import SDKCustomConfig
from fern_python.source_file_factory import SourceFileFactory


class _FakeIr:
    def __init__(self, *, auth: ir_types.ApiAuth, sdk_config: ir_types.SdkConfig) -> None:
        self.auth = auth
        self.sdk_config = sdk_config


class _FakeContext:
    def __init__(self, *, ir: _FakeIr, custom_config: SDKCustomConfig) -> None:
        self.ir = ir
        self.custom_config = custom_config


class _FakeProject:
    def __init__(self) -> None:
        self._project_config: Optional[object] = None


def _basic_auth_scheme(*, username_omit: bool = False, password_omit: bool = False) -> ir_types.AuthScheme:
    return ir_types.AuthScheme.factory.basic(
        ir_types.BasicAuthScheme(
            key="basic",
            username="username",
            username_omit=username_omit or None,
            password="password",
            password_omit=password_omit or None,
        )
    )


def _name(value: str) -> ir_types.Name:
    return ir_types.Name(
        original_name=value,
        camel_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        pascal_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        snake_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
        screaming_snake_case=ir_types.SafeAndUnsafeString(unsafe_name=value, safe_name=value),
    )


def _object_property(value: str) -> ir_types.ObjectProperty:
    return ir_types.ObjectProperty(
        name=ir_types.NameAndWireValue(wire_value=value, name=_name(value)),
        value_type=ir_types.TypeReference.factory.primitive(
            ir_types.PrimitiveType(v_1=ir_types.PrimitiveTypeV1.STRING, v_2=None)
        ),
    )


def _oauth_token_endpoint() -> ir_types.OAuthTokenEndpoint:
    return ir_types.OAuthTokenEndpoint(
        endpoint_reference=ir_types.EndpointReference(
            subpackage_id=None,
            service_id="service_auth",
            endpoint_id="endpoint_auth.getToken",
        ),
        request_properties=ir_types.OAuthAccessTokenRequestProperties(
            client_id=ir_types.RequestProperty(
                property_path=None,
                property=ir_types.RequestPropertyValue.factory.body(_object_property("client_id")),
            ),
            client_secret=ir_types.RequestProperty(
                property_path=None,
                property=ir_types.RequestPropertyValue.factory.body(_object_property("client_secret")),
            ),
            scopes=None,
            custom_properties=None,
        ),
        response_properties=ir_types.OAuthAccessTokenResponseProperties(
            access_token=ir_types.ResponseProperty(
                property_path=None,
                property=_object_property("access_token"),
            ),
            expires_in=None,
            refresh_token=None,
        ),
    )


def _oauth_auth_scheme(*, token_header: Optional[str], token_prefix: Optional[str]) -> ir_types.AuthScheme:
    return ir_types.AuthScheme.factory.oauth(
        ir_types.OAuthScheme(
            key="oauth",
            configuration=ir_types.OAuthConfiguration.factory.client_credentials(
                ir_types.OAuthClientCredentials.model_construct(
                    token_header=token_header,
                    token_prefix=token_prefix,
                    token_endpoint=_oauth_token_endpoint(),
                )
            ),
        )
    )


def _create_generator(*, scheme: ir_types.AuthScheme) -> ClientWrapperGenerator:
    ir = _FakeIr(
        auth=ir_types.ApiAuth(
            requirement=ir_types.AuthSchemesRequirement.ALL,
            schemes=[scheme],
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
    )
    return ClientWrapperGenerator(
        context=_FakeContext(ir=ir, custom_config=SDKCustomConfig.parse_obj({})),  # type: ignore[arg-type]
        generated_environment=None,
    )


def _get_async_headers_body(*, scheme: ir_types.AuthScheme) -> str:
    snippet = SourceFileFactory(should_format=False).create_snippet()
    snippet.add_arbitrary_code(AST.CodeWriter(_create_generator(scheme=scheme)._get_write_async_get_headers_body()))
    return snippet.to_str()


def _get_headers_body(
    *,
    is_auth_mandatory: bool,
    optional_auth: bool,
    scheme: Optional[ir_types.AuthScheme] = None,
    constructor_parameters: Optional[list[ConstructorParameter]] = None,
) -> str:
    ir = _FakeIr(
        auth=ir_types.ApiAuth(
            requirement=ir_types.AuthSchemesRequirement.ALL,
            schemes=[scheme if scheme is not None else _basic_auth_scheme()],
        ),
        sdk_config=ir_types.SdkConfig(
            is_auth_mandatory=is_auth_mandatory,
            has_streaming_endpoints=False,
            has_paginated_endpoints=False,
            has_file_download_endpoints=False,
            platform_headers=ir_types.PlatformHeaders(
                language="X-Fern-Language",
                sdk_name="X-Fern-SDK-Name",
                sdk_version="X-Fern-SDK-Version",
            ),
        ),
    )
    context = _FakeContext(
        ir=ir,
        custom_config=SDKCustomConfig.parse_obj({"optional-auth": True} if optional_auth else {}),
    )
    generator = ClientWrapperGenerator(
        context=context,  # type: ignore[arg-type]
        generated_environment=None,
    )
    snippet = SourceFileFactory(should_format=False).create_snippet()
    snippet.add_arbitrary_code(
        AST.CodeWriter(
            generator._get_write_get_headers_body(
                constructor_parameters=constructor_parameters or [],
                literal_headers=[],
                project=_FakeProject(),  # type: ignore[arg-type]
            )
        )
    )
    return snippet.to_str()


def _squash(body: str) -> str:
    """Collapses the writer's line breaks so assertions read like the emitted statement."""
    return re.sub(r"\s*\n\s*", " ", body).replace("( ", "(").replace(", )", ")")


def test_basic_auth_header_is_unconditional_when_auth_is_mandatory() -> None:
    body = _get_headers_body(is_auth_mandatory=True, optional_auth=False)
    assert (
        'headers["Authorization"] = httpx.BasicAuth(self._get_username(), self._get_password())._auth_header'
        in _squash(body)
    )
    assert "if username is not None" not in body


def test_basic_auth_header_is_conditional_when_optional_auth_is_enabled() -> None:
    body = _get_headers_body(is_auth_mandatory=True, optional_auth=True)
    assert "username = self._get_username()" in body
    assert "password = self._get_password()" in body
    assert "if username is not None and password is not None:" in body
    assert 'headers["Authorization"] = httpx.BasicAuth(username, password)._auth_header' in _squash(body)


def test_optional_auth_matches_non_mandatory_auth_for_basic_auth() -> None:
    assert _get_headers_body(is_auth_mandatory=True, optional_auth=True) == _get_headers_body(
        is_auth_mandatory=False, optional_auth=False
    )


def test_optional_auth_only_checks_the_non_omitted_basic_auth_field() -> None:
    body = _get_headers_body(
        is_auth_mandatory=True,
        optional_auth=True,
        scheme=_basic_auth_scheme(username_omit=True),
    )
    assert "username = self._get_username()" not in body
    assert "if password is not None:" in body
    assert 'headers["Authorization"] = httpx.BasicAuth("", password)._auth_header' in _squash(body)


def test_bearer_auth_header_is_not_emitted_by_get_headers() -> None:
    bearer = ir_types.AuthScheme.factory.bearer(
        ir_types.BearerAuthScheme(
            key="bearer",
            token="token",
        )
    )
    optional = _get_headers_body(is_auth_mandatory=True, optional_auth=True, scheme=bearer)
    mandatory = _get_headers_body(is_auth_mandatory=True, optional_auth=False, scheme=bearer)
    # Bearer headers come from the constructor parameters, so neither variant emits an
    # Authorization header here; the difference lives in the parameter's requiredness.
    assert "Authorization" not in optional
    assert "Authorization" not in mandatory


def test_oauth_async_header_uses_custom_header_without_empty_prefix_spacing() -> None:
    body = _get_async_headers_body(
        scheme=_oauth_auth_scheme(
            token_header="X-Custom-Token",
            token_prefix="",
        )
    )
    assert 'headers["X-Custom-Token"] = token' in body
    assert "Bearer" not in body


def test_header_auth_empty_prefix_preserves_string_coercion() -> None:
    body = _get_headers_body(
        is_auth_mandatory=True,
        optional_auth=False,
        constructor_parameters=[
            ConstructorParameter(
                constructor_parameter_name="api_key",
                type_hint=AST.TypeHint.int_(),
                private_member_name="_api_key",
                initializer=AST.Expression("api_key=1"),
                header_key="X-Custom-Header",
                header_prefix="",
                is_auth=True,
            )
        ],
    )
    assert 'headers["X-Custom-Header"] = f" {self._api_key}"' in body


def test_oauth_async_header_preserves_default_header_and_prefix() -> None:
    body = _get_async_headers_body(
        scheme=_oauth_auth_scheme(
            token_header=None,
            token_prefix=None,
        )
    )
    assert 'headers["Authorization"] = f"Bearer {token}"' in body


def test_optional_auth_custom_config_aliases() -> None:
    assert SDKCustomConfig.parse_obj({"optional-auth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({"optionalAuth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({"optional_auth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({}).optional_auth is False
