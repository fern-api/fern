from fern_python.generators.sdk.custom_config import SDKCustomConfig
import pydantic
import pytest


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

    assert top_level_custom_config.use_typeddict_requests == top_level_custom_config.pydantic_config.use_typeddict_requests
    
    assert pydantic_config_custom_config.use_typeddict_requests == pydantic_config_custom_config.pydantic_config.use_typeddict_requests

    assert top_level_custom_config.use_typeddict_requests == pydantic_config_custom_config.use_typeddict_requests
    assert top_level_custom_config.pydantic_config.use_typeddict_requests == pydantic_config_custom_config.pydantic_config.use_typeddict_requests


def test_parse_wrapped_aliases() -> None:
    v1 = {
         "pydantic_config": {
            "version": "v1",
            "wrapped_aliases": True,
        },
    }
    sdk_custom_config = SDKCustomConfig.parse_obj(v1)
    assert sdk_custom_config.pydantic_config.version == "v1" and sdk_custom_config.pydantic_config.wrapped_aliases is True

    v2 = {
        "pydantic_config": {
            "version": "v2",
            "wrapped_aliases": True,
        },
    }
    sdk_custom_config_v2 = SDKCustomConfig.parse_obj(v2)
    assert sdk_custom_config_v2.pydantic_config.version == "v2" and sdk_custom_config_v2.pydantic_config.wrapped_aliases is True

    
    both = {
        "pydantic_config": {
            "version": "both",
            "wrapped_aliases": True,
        },
    }
    with pytest.raises(pydantic.ValidationError, match="Wrapped aliases are not supported for `both`, please update your `version` field to be 'v1' or `v2` to continue using wrapped aliases."):
        SDKCustomConfig.parse_obj(both)
