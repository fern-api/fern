import re
from typing import Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST
from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    ClientWrapperGenerator,
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


def _get_headers_body(
    *,
    is_auth_mandatory: bool,
    optional_auth: bool,
    scheme: Optional[ir_types.AuthScheme] = None,
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
                constructor_parameters=[],
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


def test_optional_auth_custom_config_aliases() -> None:
    assert SDKCustomConfig.parse_obj({"optional-auth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({"optionalAuth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({"optional_auth": True}).optional_auth is True
    assert SDKCustomConfig.parse_obj({}).optional_auth is False
