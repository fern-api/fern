from fern_python.generators.sdk.custom_config import SDKCustomConfig


def test_user_agent_only_defaults_to_false() -> None:
    config = SDKCustomConfig.parse_obj({})
    assert config.user_agent_only is False


def test_user_agent_only_snake_case() -> None:
    config = SDKCustomConfig.parse_obj({"user_agent_only": True})
    assert config.user_agent_only is True


def test_user_agent_only_camel_case_alias() -> None:
    config = SDKCustomConfig.parse_obj({"userAgentOnly": True})
    assert config.user_agent_only is True
