import typing

from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    APPEND_APP_INFO_HELPER_SOURCE,
)
from fern_python.generators.sdk.custom_config import SDKCustomConfig

# The `_append_app_info_to_user_agent` sanitizer is emitted as Python *source* into the
# generated client wrapper (only when `allow_user_agent_app_info` is enabled), rather than
# imported from a shared module, so that flag-off output stays byte-identical. These tests
# exec exactly that emitted source and assert against the behavior SDK consumers receive.

AppendFn = typing.Callable[[str, typing.Optional[typing.Dict[str, str]]], str]


def _load_emitted_helper() -> AppendFn:
    namespace: typing.Dict[str, typing.Any] = {"typing": typing}
    exec(APPEND_APP_INFO_HELPER_SOURCE, namespace)
    helper = namespace["_append_app_info_to_user_agent"]
    assert callable(helper)
    return typing.cast(AppendFn, helper)


_append = _load_emitted_helper()
BASE = "my-sdk/1.0"


def test_returns_user_agent_unchanged_when_app_info_absent() -> None:
    assert _append(BASE, None) == BASE


def test_returns_user_agent_unchanged_when_name_empty() -> None:
    assert _append(BASE, {"name": ""}) == BASE


def test_returns_user_agent_unchanged_when_name_whitespace_only() -> None:
    # Regression: whitespace-only name must NOT produce a junk `%20%20%20` token.
    assert _append(BASE, {"name": "   "}) == BASE
    assert _append(BASE, {"name": "\t\n "}) == BASE


def test_appends_name_only() -> None:
    assert _append(BASE, {"name": "partner-app"}) == f"{BASE} partner-app"


def test_appends_name_and_version() -> None:
    assert _append(BASE, {"name": "partner-app", "version": "3.1.0"}) == f"{BASE} partner-app/3.1.0"


def test_appends_name_version_and_comment() -> None:
    assert (
        _append(BASE, {"name": "partner-app", "version": "3.1.0", "comment": "+https://partner.example"})
        == f"{BASE} partner-app/3.1.0 (+https://partner.example)"
    )


def test_omits_version_segment_when_blank() -> None:
    # Regression: whitespace-only version must NOT produce a junk `/%20%20` segment.
    assert _append(BASE, {"name": "partner-app", "version": ""}) == f"{BASE} partner-app"
    assert _append(BASE, {"name": "partner-app", "version": "   "}) == f"{BASE} partner-app"


def test_omits_comment_group_when_blank() -> None:
    assert _append(BASE, {"name": "partner-app", "comment": "   "}) == f"{BASE} partner-app"


def test_trims_surrounding_whitespace_before_encoding() -> None:
    assert (
        _append(BASE, {"name": " partner-app ", "version": " 3.1.0 ", "comment": " a comment "})
        == f"{BASE} partner-app/3.1.0 (a comment)"
    )


def test_token_encodes_spaces_in_name() -> None:
    result = _append(BASE, {"name": "evil app"})
    assert result == f"{BASE} evil%20app"
    assert "evil app" not in result


def test_prevents_crlf_injection_via_name() -> None:
    result = _append(BASE, {"name": "x\r\nX-Injected: 1"})
    assert "\r" not in result
    assert "\n" not in result
    assert "%0D%0A" in result


def test_prevents_crlf_injection_via_version() -> None:
    result = _append(BASE, {"name": "app", "version": "1.0\r\nEvil: 1"})
    assert "\r" not in result
    assert "\n" not in result
    assert "%0D%0A" in result


def test_prevents_crlf_injection_via_comment() -> None:
    result = _append(BASE, {"name": "app", "comment": "ok\r\nEvil: 1"})
    assert "\r" not in result
    assert "\n" not in result
    assert "%0D%0A" in result


def test_escapes_parentheses_and_backslash_in_comment() -> None:
    result = _append(BASE, {"name": "app", "comment": "a)b(c\\d"})
    assert result == f"{BASE} app (a%29b%28c%5Cd)"


def test_keeps_printable_comment_characters_readable() -> None:
    assert (
        _append(BASE, {"name": "app", "comment": "+https://partner.example/path?q=1"})
        == f"{BASE} app (+https://partner.example/path?q=1)"
    )


# ── config parsing ──────────────────────────────────────────────────────────────


def test_allow_user_agent_app_info_defaults_to_false() -> None:
    config = SDKCustomConfig.parse_obj({})
    assert config.allow_user_agent_app_info is False


def test_allow_user_agent_app_info_snake_case() -> None:
    config = SDKCustomConfig.parse_obj({"allow_user_agent_app_info": True})
    assert config.allow_user_agent_app_info is True


def test_allow_user_agent_app_info_camel_case_alias() -> None:
    config = SDKCustomConfig.parse_obj({"allowUserAgentAppInfo": True})
    assert config.allow_user_agent_app_info is True
