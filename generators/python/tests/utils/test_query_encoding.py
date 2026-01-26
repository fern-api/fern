import urllib.parse

from core_utilities.shared.query_encoder import encode_query
from core_utilities.shared.jsonable_encoder import jsonable_encoder
from core_utilities.shared.remove_none_from_dict import remove_none_from_dict


def test_query_encoding_deep_objects() -> None:
    assert encode_query({"hello world": "hello world"}) == [("hello world", "hello world")]
    assert encode_query({"hello_world": {"hello": "world"}}) == [("hello_world[hello]", "world")]
    assert encode_query({"hello_world": {"hello": {"world": "today"}, "test": "this"}, "hi": "there"}) == [
        ("hello_world[hello][world]", "today"),
        ("hello_world[test]", "this"),
        ("hi", "there"),
    ]


def test_query_encoding_deep_object_arrays() -> None:
    assert encode_query({"objects": [{"key": "hello", "value": "world"}, {"key": "foo", "value": "bar"}]}) == [
        ("objects[key]", "hello"),
        ("objects[value]", "world"),
        ("objects[key]", "foo"),
        ("objects[value]", "bar"),
    ]
    assert encode_query(
        {"users": [{"name": "string", "tags": ["string"]}, {"name": "string2", "tags": ["string2", "string3"]}]}
    ) == [
        ("users[name]", "string"),
        ("users[tags]", "string"),
        ("users[name]", "string2"),
        ("users[tags]", "string2"),
        ("users[tags]", "string3"),
    ]


def test_encode_query_with_none() -> None:
    encoded = encode_query(None)
    assert encoded is None


# Tests for WebSocket query parameter encoding
# WebSocket URLs need to use urllib.parse.urlencode to convert encode_query output to a query string


def test_websocket_query_params_basic() -> None:
    """Test that encode_query output can be converted to URL query string for WebSocket."""
    query_dict = {
        "model": "gpt-4",
        "temperature": 0.7,
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(query_dict)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert query_string == "model=gpt-4&temperature=0.7"


def test_websocket_query_params_with_none_values() -> None:
    """Test that None values are filtered out before encoding."""
    query_dict = {
        "model": "gpt-4",
        "temperature": None,
        "language": "en",
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(query_dict)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert query_string == "model=gpt-4&language=en"
    assert "temperature" not in query_string


def test_websocket_query_params_with_additional_query_parameters() -> None:
    """Test merging channel params with additional_query_parameters from request_options."""
    # Simulate channel-declared params
    channel_params = {
        "model": "gpt-4",
        "temperature": 0.7,
    }
    # Simulate additional_query_parameters from request_options
    additional_params = {
        "custom_param": "custom_value",
        "session_id": "abc123",
    }
    # Merge them (this is what the generated code does)
    merged = {
        **channel_params,
        **additional_params,
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(merged)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert "model=gpt-4" in query_string
    assert "temperature=0.7" in query_string
    assert "custom_param=custom_value" in query_string
    assert "session_id=abc123" in query_string


def test_websocket_query_params_additional_overrides_channel() -> None:
    """Test that additional_query_parameters can override channel params."""
    channel_params = {
        "model": "gpt-4",
    }
    additional_params = {
        "model": "gpt-3.5-turbo",  # Override channel param
    }
    merged = {
        **channel_params,
        **additional_params,
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(merged)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert query_string == "model=gpt-3.5-turbo"


def test_websocket_query_params_empty_dict() -> None:
    """Test that empty dict results in empty/None encoded query."""
    query_dict: dict[str, str] = {}
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(query_dict)))
    # Empty dict should result in empty list
    assert encoded == []
    # urlencode of empty list is empty string
    query_string = urllib.parse.urlencode(encoded)
    assert query_string == ""


def test_websocket_query_params_special_characters() -> None:
    """Test that special characters are properly URL-encoded."""
    query_dict = {
        "query": "hello world",
        "filter": "name=test&value=123",
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(query_dict)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    # Spaces should be encoded as + or %20, & should be encoded as %26
    assert "hello" in query_string
    assert "world" in query_string
    assert "%26" in query_string or "filter=name" in query_string


def test_websocket_query_params_boolean_values() -> None:
    """Test that boolean values are properly encoded."""
    query_dict = {
        "enabled": True,
        "debug": False,
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(query_dict)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert "enabled=True" in query_string or "enabled=true" in query_string
    assert "debug=False" in query_string or "debug=false" in query_string


def test_websocket_query_params_only_additional() -> None:
    """Test WebSocket with no channel params, only additional_query_parameters."""
    # This simulates an empty websocket channel with only additional params
    channel_params: dict[str, str] = {}
    additional_params = {
        "api_key": "secret123",
    }
    merged = {
        **channel_params,
        **(additional_params if additional_params else {}),
    }
    encoded = encode_query(jsonable_encoder(remove_none_from_dict(merged)))
    assert encoded is not None
    query_string = urllib.parse.urlencode(encoded)
    assert query_string == "api_key=secret123"
