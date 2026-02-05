from .conftest import get_client, verify_request_count


def test__chat_stream() -> None:
    """Test chat_stream endpoint with WireMock"""
    test_id = "chat_stream.0"
    client = get_client(test_id)
    for _ in client.chat_stream(prompt="prompt"):
        pass
    verify_request_count(test_id, "POST", "/chat", None, 1)


def test__chat() -> None:
    """Test chat endpoint with WireMock"""
    test_id = "chat.0"
    client = get_client(test_id)
    client.chat(prompt="Hello")
    verify_request_count(test_id, "POST", "/chat", None, 1)
