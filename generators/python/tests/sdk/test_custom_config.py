from fern_python.generators.sdk.custom_config import SDKCustomConfig


top_level_payload = {
    "use_typeddict_requests": True,
}

pydantic_config_level_payload = {
    "pydantic_config": {
        "use_typeddict_requests": True,
    },
}

def test_parse_obj_override() -> None:
    top_level_custom_config = SDKCustomConfig.parse_obj(top_level_payload)
    pydantic_config_custom_config = SDKCustomConfig.parse_obj(pydantic_config_level_payload)
    
    assert top_level_custom_config.use_typeddict_requests is True
    assert pydantic_config_custom_config.pydantic_config.use_typeddict_requests is True

    assert top_level_custom_config.use_typeddict_requests == top_level_custom_config.pydantic_config.use_typeddict_requests
    
    assert pydantic_config_custom_config.use_typeddict_requests == pydantic_config_custom_config.pydantic_config.use_typeddict_requests

    assert top_level_custom_config.use_typeddict_requests == pydantic_config_custom_config.use_typeddict_requests
    assert top_level_custom_config.pydantic_config.use_typeddict_requests == pydantic_config_custom_config.pydantic_config.use_typeddict_requests

