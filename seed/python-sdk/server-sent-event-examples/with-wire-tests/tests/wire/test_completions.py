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


def test_completions_stream_events() -> None:
    """Test streamEvents endpoint with WireMock"""
    test_id = "completions.stream_events.0"
    client = get_client(test_id)
    for _ in client.completions.stream_events(
        query="query",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream-events", None, 1)


def test_completions_stream_events_context_protocol() -> None:
    """Test streamEventsContextProtocol endpoint with WireMock"""
    test_id = "completions.stream_events_context_protocol.0"
    client = get_client(test_id)
    for _ in client.completions.stream_events_context_protocol(
        query="",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream-events-context-protocol", None, 1)
