from fern_python.generators.sdk.custom_config import SDKCustomConfig
import pydantic
import pytest


def test_max_retries_default() -> None:
    """Default value of default_max_retries is 2."""
    config = SDKCustomConfig.parse_obj({})
    assert config.default_max_retries == 2


def test_max_retries_camel_case_alias() -> None:
    """maxRetries (camelCase) is accepted and mapped to default_max_retries."""
    config = SDKCustomConfig.parse_obj({"maxRetries": 5})
    assert config.default_max_retries == 5


def test_max_retries_snake_case() -> None:
    """default_max_retries (snake_case) is also accepted directly."""
    config = SDKCustomConfig.parse_obj({"default_max_retries": 3})
    assert config.default_max_retries == 3


def test_max_retries_zero_disables_retries() -> None:
    """Setting maxRetries to 0 disables retries."""
    config = SDKCustomConfig.parse_obj({"maxRetries": 0})
    assert config.default_max_retries == 0


def test_max_retries_rejects_negative() -> None:
    """Negative values for maxRetries are rejected."""
    with pytest.raises(pydantic.ValidationError):
        SDKCustomConfig.parse_obj({"maxRetries": -1})


def test_max_retries_camel_case_ignored_when_snake_case_present() -> None:
    """When default_max_retries is already present, maxRetries is not mapped (extra=forbid rejects it)."""
    with pytest.raises(pydantic.ValidationError):
        SDKCustomConfig.parse_obj({"maxRetries": 5, "default_max_retries": 3})


def test_parse_obj_override() -> None:
    top_level_payload = {
        "use_typeddict_requests": True,
    }

    pydantic_config_level_payload = {
        "pydantic_config": {
            "use_typeddict_requests": True,
        },
    }

    top_level_custom_config = SDKCustomConfig.parse_obj(top_level_payload)
    pydantic_config_custom_config = SDKCustomConfig.parse_obj(pydantic_config_level_payload)

    assert top_level_custom_config.use_typeddict_requests is True
    assert pydantic_config_custom_config.pydantic_config.use_typeddict_requests is True

    assert (
        top_level_custom_config.use_typeddict_requests == top_level_custom_config.pydantic_config.use_typeddict_requests
    )

    assert (
        pydantic_config_custom_config.use_typeddict_requests
        == pydantic_config_custom_config.pydantic_config.use_typeddict_requests
    )

    assert top_level_custom_config.use_typeddict_requests == pydantic_config_custom_config.use_typeddict_requests
    assert (
        top_level_custom_config.pydantic_config.use_typeddict_requests
        == pydantic_config_custom_config.pydantic_config.use_typeddict_requests
    )


def test_parse_wrapped_aliases() -> None:
    v1 = {
        "pydantic_config": {
            "version": "v1",
            "wrapped_aliases": True,
        },
    }
    sdk_custom_config = SDKCustomConfig.parse_obj(v1)
    assert (
        sdk_custom_config.pydantic_config.version == "v1" and sdk_custom_config.pydantic_config.wrapped_aliases is True
    )

    v2 = {
        "pydantic_config": {
            "version": "v2",
            "wrapped_aliases": True,
        },
    }
    sdk_custom_config_v2 = SDKCustomConfig.parse_obj(v2)
    assert (
        sdk_custom_config_v2.pydantic_config.version == "v2"
        and sdk_custom_config_v2.pydantic_config.wrapped_aliases is True
    )
    both = {
        "pydantic_config": {
            "version": "both",
            "wrapped_aliases": True,
        },
    }
    with pytest.raises(
        pydantic.ValidationError,
        match="Wrapped aliases are only supported in Pydantic V1, V1_ON_V2, or V2, please update your `version` field appropriately to continue using wrapped aliases.",
    ):
        SDKCustomConfig.parse_obj(both)
