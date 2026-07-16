from .conftest import get_client, verify_request_count


def test_query_send() -> None:
    """Test send endpoint with WireMock"""
    test_id = "query.send.0"
    client = get_client(test_id)
    client.query.send(
        optional_prompt="You are a helpful assistant",
        alias_optional_prompt="You are a helpful assistant",
        optional_stream=False,
        alias_optional_stream=False,
        query="What is the weather today",
    )
    verify_request_count(
        test_id,
        "POST",
        "/query",
        {
            "prompt": "You are a helpful assistant",
            "optional_prompt": "You are a helpful assistant",
            "alias_prompt": "You are a helpful assistant",
            "alias_optional_prompt": "You are a helpful assistant",
            "stream": "false",
            "optional_stream": "false",
            "alias_stream": "false",
            "alias_optional_stream": "false",
            "query": "What is the weather today",
        },
        1,
    )
