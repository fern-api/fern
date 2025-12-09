from .conftest import get_client, verify_request_count


def test_completions_stream() -> None:
    """Test stream endpoint with WireMock"""
    test_id = "completions.stream.0"
    client = get_client(test_id)
    client.completions.stream(query="query")
    verify_request_count(test_id, "POST", "/stream", None, 1)
