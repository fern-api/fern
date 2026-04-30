from fern_python.utils.name_resolver import _smart_snake


def test_smart_snake_digit_prefix_collapses_to_match_canonical_casings() -> None:
    # Names starting with a digit are sanitized later (3d -> _3d -> f_3d), so
    # the leading "N_xxx" is collapsed to "Nxxx" to match the canonical IR output.
    assert _smart_snake("3d") == "3d"
    assert _smart_snake("2fa") == "2fa"


def test_smart_snake_digit_in_middle_uses_plain_snake_case() -> None:
    # Digits between camelCase words become word boundaries, matching plain
    # lodash snakeCase (which is what the IR pre-computes for these names).
    assert _smart_snake("setFcmv1Provider") == "set_fcmv_1_provider"
    assert _smart_snake("updateFcmv1Provider") == "update_fcmv_1_provider"
    assert _smart_snake("setFCMV1Provider") == "set_fcmv_1_provider"


def test_smart_snake_digit_in_snake_cased_name_preserves_separators() -> None:
    # Already-snake-cased wire values must round-trip correctly.
    assert _smart_snake("auth0_mapping") == "auth_0_mapping"
    assert _smart_snake("auth0Mapping") == "auth_0_mapping"


def test_smart_snake_basic_camel_and_snake() -> None:
    assert _smart_snake("helloWorld") == "hello_world"
    assert _smart_snake("hello_world") == "hello_world"
    assert _smart_snake("HelloWorld") == "hello_world"


def test_smart_snake_space_separated() -> None:
    assert _smart_snake("hello world") == "hello_world"
    assert _smart_snake("get user by id") == "get_user_by_id"
