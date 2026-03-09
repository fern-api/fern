from .conftest import get_client, verify_request_count


def test_completions_stream() -> None:
    """Test stream endpoint with WireMock"""
    test_id = "completions.stream.0"
    client = get_client(test_id)
    for _ in client.completions.stream(
        query="foo",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream", None, 1)


def test_completions_stream_without_terminator() -> None:
    """Test streamWithoutTerminator endpoint with WireMock"""
    test_id = "completions.stream_without_terminator.0"
    client = get_client(test_id)
    for _ in client.completions.stream_without_terminator(
        query="query",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream-no-terminator", None, 1)
