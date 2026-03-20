from .conftest import get_client, verify_request_count


def test_completions_stream() -> None:
    """Test stream endpoint with WireMock"""
    test_id = "completions.stream.0"
    client = get_client(test_id)
    response = list(
        client.completions.stream(
            query="foo",
        )
    )
    assert len(response) == 2
    assert response[0].delta == "foo"
    assert response[0].tokens == 1
    assert response[1].delta == "bar"
    assert response[1].tokens == 2
    verify_request_count(test_id, "POST", "/stream", None, 1)


def test_completions_stream_events() -> None:
    """Test streamEvents endpoint with WireMock"""
    test_id = "completions.stream_events.0"
    client = get_client(test_id)
    response = list(
        client.completions.stream_events(
            query="query",
        )
    )
    assert len(response) == 2
    assert response[0].event == "completion"
    assert response[0].content == "hello"
    assert response[1].event == "error"
    assert response[1].error == "something went wrong"
    verify_request_count(test_id, "POST", "/stream-events", None, 1)


def test_completions_stream_events_context_protocol() -> None:
    """Test streamEventsContextProtocol endpoint with WireMock"""
    test_id = "completions.stream_events_context_protocol.0"
    client = get_client(test_id)
    response = list(
        client.completions.stream_events_context_protocol(
            query="query",
        )
    )
    assert len(response) == 2
    assert response[0].event == "completion"
    assert response[0].content == "hello"
    assert response[1].event == "error"
    assert response[1].error == "something went wrong"
    verify_request_count(test_id, "POST", "/stream-events-context-protocol", None, 1)
