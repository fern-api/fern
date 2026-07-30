from fern_python.generators.sdk.core_utilities.client_wrapper_generator import (
    _get_user_agent_coordinate_prefix,
)


def test_strips_the_version_segment() -> None:
    assert _get_user_agent_coordinate_prefix("acme-sdk-internal/1.2.0") == "acme-sdk-internal/"


def test_keeps_earlier_separators() -> None:
    assert _get_user_agent_coordinate_prefix("@acme/sdk/1.2.0") == "@acme/sdk/"


def test_treats_a_value_without_a_separator_as_the_product_name() -> None:
    assert _get_user_agent_coordinate_prefix("acme-sdk-internal") == "acme-sdk-internal/"
