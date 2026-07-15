"""Tests for the smart-casing dispatch in name_resolver.

Mirrors @fern-api/casings-generator's `smartCasing` flag from generators.yml.
When `smart-casing: true` (the default), digits adjacent to letters stay attached
(`base64` -> `base64`). When `smart-casing: false`, every digit run is a word
boundary, matching plain lodash `snakeCase` (`base64` -> `base_64`,
`setFcmv1Provider` -> `set_fcmv_1_provider`).
"""

from typing import Iterator

import pytest

from fern_python.utils import configure_smart_casing
from fern_python.utils.name_resolver import _resolve_string_name, _smart_snake


@pytest.fixture(autouse=True)
def reset_smart_casing() -> Iterator[None]:
    """Restore the default (smartCasing=True) between tests so module state
    doesn't leak across test order."""
    configure_smart_casing(True)
    yield
    configure_smart_casing(True)


class TestSmartCasingTrue:
    """Default behavior: digit suffixes attach (`base64`, `applicationV1`, `v2`)."""

    def test_digit_suffixes_attach(self) -> None:
        assert _smart_snake("base64") == "base64"
        assert _smart_snake("utf8") == "utf8"
        assert _smart_snake("sha256") == "sha256"

    def test_camelcase_with_trailing_digit_keeps_digit_attached(self) -> None:
        assert _smart_snake("applicationV1") == "application_v1"

    def test_short_digit_prefixed_identifier(self) -> None:
        assert _smart_snake("3d") == "3d"
        assert _smart_snake("2fa") == "2fa"

    def test_digit_in_middle_of_camelcase(self) -> None:
        # By default, a digit between camelCase words collapses to no separator.
        # This matches the canonical TS smartSnakeFn default.
        assert _smart_snake("setFcmv1Provider") == "set_fcmv1provider"
        assert _smart_snake("auth0Mapping") == "auth0mapping"

    def test_capitalized_word_after_digit_stays_fused(self) -> None:
        assert _smart_snake("ConversationsV2Configuration") == "conversations_v2configuration"
        assert _smart_snake("CreateOauth2Token") == "create_oauth2token"

    def test_digit_then_lowercase_stays_fused(self) -> None:
        assert _smart_snake("2v22") == "2v22"
        assert _smart_snake("v2beta") == "v2beta"


class TestSmartCasingDigitWordBoundary:
    """smart-casing-digit-word-boundary: true — a capitalized word after a digit
    run keeps its word boundary."""

    def setup_method(self) -> None:
        configure_smart_casing(True, True)

    def test_capitalized_word_after_digit_separates(self) -> None:
        assert _smart_snake("ConversationsV2Configuration") == "conversations_v2_configuration"
        assert _smart_snake("CreateOauth2Token") == "create_oauth2_token"
        assert _smart_snake("Mode5InterrogationResponse") == "mode5_interrogation_response"
        assert _smart_snake("Int32Value") == "int32_value"

    def test_digit_in_middle_of_camelcase(self) -> None:
        assert _smart_snake("setFcmv1Provider") == "set_fcmv1_provider"
        assert _smart_snake("auth0Mapping") == "auth0_mapping"

    def test_trailing_digits_stay_attached(self) -> None:
        assert _smart_snake("applicationV1") == "application_v1"
        assert _smart_snake("v2") == "v2"

    def test_digit_then_lowercase_stays_fused(self) -> None:
        assert _smart_snake("2v22") == "2v22"
        assert _smart_snake("v2beta") == "v2beta"


class TestSmartCasingFalse:
    """smart-casing: false (e.g. auth0 generators.yml): digit runs are word boundaries."""

    def setup_method(self) -> None:
        configure_smart_casing(False)

    def test_digit_suffixes_separate(self) -> None:
        assert _smart_snake("base64") == "base_64"
        assert _smart_snake("utf8") == "utf_8"

    def test_digit_in_camelcase_separates(self) -> None:
        # The auth0 case that motivated this flag.
        assert _smart_snake("setFcmv1Provider") == "set_fcmv_1_provider"
        assert _smart_snake("updateFcmv1Provider") == "update_fcmv_1_provider"

    def test_digit_in_snake_case_preserves_separators(self) -> None:
        assert _smart_snake("auth0_mapping") == "auth_0_mapping"
        assert _smart_snake("auth0Mapping") == "auth_0_mapping"

    def test_multiple_digit_runs(self) -> None:
        assert _smart_snake("org.iso.18013.5.1") == "org_iso_18013_5_1"
        assert _smart_snake("org_iso_18013_5_1") == "org_iso_18013_5_1"


class TestConfigureSmartCasing:
    def test_toggling_clears_resolve_cache(self) -> None:
        configure_smart_casing(True)
        smart = _resolve_string_name("setFcmv1Provider")
        assert smart.snake_case.safe_name == "set_fcmv1provider"

        configure_smart_casing(False)
        plain = _resolve_string_name("setFcmv1Provider")
        assert plain.snake_case.safe_name == "set_fcmv_1_provider"
        assert plain is not smart

    def test_toggling_digit_word_boundary_clears_resolve_cache(self) -> None:
        configure_smart_casing(True)
        fused = _resolve_string_name("setFcmv1Provider")
        assert fused.snake_case.safe_name == "set_fcmv1provider"

        configure_smart_casing(True, True)
        boundary = _resolve_string_name("setFcmv1Provider")
        assert boundary.snake_case.safe_name == "set_fcmv1_provider"
        assert boundary is not fused

    def test_no_op_configure_preserves_cache(self) -> None:
        configure_smart_casing(True)
        first = _resolve_string_name("setFcmv1Provider")
        configure_smart_casing(True)
        second = _resolve_string_name("setFcmv1Provider")
        assert first is second

    def test_digit_prefixed_identifier_remains_safe_under_both_modes(self) -> None:
        # Field "3d" is the original reserved-keywords seed case: must produce
        # a valid Python identifier (sanitized to f_3d downstream) regardless
        # of smart-casing. With smartCasing it goes 3d -> _3d -> f_3d; without
        # it goes 3_d -> _3_d -> f_3_d. Both are valid.
        configure_smart_casing(True)
        assert _resolve_string_name("3d").snake_case.safe_name == "_3d"
        configure_smart_casing(False)
        assert _resolve_string_name("3d").snake_case.safe_name == "_3_d"
