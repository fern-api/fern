import json

from .conftest import get_client, verify_request_count


def test__stream_protocol_no_collision() -> None:
    """Test streamProtocolNoCollision endpoint with WireMock"""
    test_id = "stream_protocol_no_collision.0"
    client = get_client(test_id)
    events = list(
        client.stream_protocol_no_collision(
            query="query",
        )
    )
    assert len(events) == 4, f"Expected 4 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {"event": "string_data", "data": "data"}, "Event 1 mismatch"
    event_2_json = json.loads(events[2].json())  # type: ignore
    assert event_2_json == {"event": "number_data", "data": 1.1}, "Event 2 mismatch"
    event_3_json = json.loads(events[3].json())  # type: ignore
    assert event_3_json == {
        "event": "object_data",
        "data": {"message": "message", "timestamp": "2024-01-15T09:30:00Z"},
    }, "Event 3 mismatch"
    verify_request_count(test_id, "POST", "/stream/protocol-no-collision", None, 1)


def test__stream_protocol_collision() -> None:
    """Test streamProtocolCollision endpoint with WireMock"""
    test_id = "stream_protocol_collision.0"
    client = get_client(test_id)
    events = list(
        client.stream_protocol_collision(
            query="query",
        )
    )
    assert len(events) == 4, f"Expected 4 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {"event": "string_data", "data": "data"}, "Event 1 mismatch"
    event_2_json = json.loads(events[2].json())  # type: ignore
    assert event_2_json == {"event": "number_data", "data": 1.1}, "Event 2 mismatch"
    event_3_json = json.loads(events[3].json())  # type: ignore
    assert event_3_json == {"event": "object_data", "data": {"id": "id", "name": "name", "event": "event"}}, (
        "Event 3 mismatch"
    )
    verify_request_count(test_id, "POST", "/stream/protocol-collision", None, 1)


def test__stream_data_context() -> None:
    """Test streamDataContext endpoint with WireMock"""
    test_id = "stream_data_context.0"
    client = get_client(test_id)
    events = list(
        client.stream_data_context(
            query="query",
        )
    )
    assert len(events) == 2, f"Expected 2 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat", "timestamp": "2024-01-15T09:30:00Z"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {
        "event": "entity",
        "entityId": "entityId",
        "eventType": "CREATED",
        "updatedTime": "2024-01-15T09:30:00Z",
    }, "Event 1 mismatch"
    verify_request_count(test_id, "POST", "/stream/data-context", None, 1)


def test__stream_no_context() -> None:
    """Test streamNoContext endpoint with WireMock"""
    test_id = "stream_no_context.0"
    client = get_client(test_id)
    events = list(
        client.stream_no_context(
            query="query",
        )
    )
    assert len(events) == 2, f"Expected 2 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat", "timestamp": "2024-01-15T09:30:00Z"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {
        "event": "entity",
        "entityId": "entityId",
        "eventType": "CREATED",
        "updatedTime": "2024-01-15T09:30:00Z",
    }, "Event 1 mismatch"
    verify_request_count(test_id, "POST", "/stream/no-context", None, 1)


def test__stream_protocol_with_flat_schema() -> None:
    """Test streamProtocolWithFlatSchema endpoint with WireMock"""
    test_id = "stream_protocol_with_flat_schema.0"
    client = get_client(test_id)
    events = list(
        client.stream_protocol_with_flat_schema(
            query="query",
        )
    )
    assert len(events) == 2, f"Expected 2 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat", "timestamp": "2024-01-15T09:30:00Z"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {
        "event": "entity",
        "entityId": "entityId",
        "eventType": "CREATED",
        "updatedTime": "2024-01-15T09:30:00Z",
    }, "Event 1 mismatch"
    verify_request_count(test_id, "POST", "/stream/protocol-with-flat-schema", None, 1)


def test__stream_data_context_with_envelope_schema() -> None:
    """Test streamDataContextWithEnvelopeSchema endpoint with WireMock"""
    test_id = "stream_data_context_with_envelope_schema.0"
    client = get_client(test_id)
    events = list(
        client.stream_data_context_with_envelope_schema(
            query="query",
        )
    )
    assert len(events) == 4, f"Expected 4 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"event": "heartbeat"}, "Event 0 mismatch"
    event_1_json = json.loads(events[1].json())  # type: ignore
    assert event_1_json == {"event": "string_data", "data": "data"}, "Event 1 mismatch"
    event_2_json = json.loads(events[2].json())  # type: ignore
    assert event_2_json == {"event": "number_data", "data": 1.1}, "Event 2 mismatch"
    event_3_json = json.loads(events[3].json())  # type: ignore
    assert event_3_json == {
        "event": "object_data",
        "data": {"message": "message", "timestamp": "2024-01-15T09:30:00Z"},
    }, "Event 3 mismatch"
    verify_request_count(test_id, "POST", "/stream/data-context-with-envelope-schema", None, 1)


def test__stream_oas_spec_native() -> None:
    """Test streamOasSpecNative endpoint with WireMock"""
    test_id = "stream_oas_spec_native.0"
    client = get_client(test_id)
    events = list(client.stream_oas_spec_native())
    assert len(events) == 1, f"Expected 1 events, got {len(events)}"
    event_0_json = json.loads(events[0].json())  # type: ignore
    assert event_0_json == {"data": "data", "event": "event", "id": "id", "retry": 1}, "Event 0 mismatch"
    verify_request_count(test_id, "POST", "/stream/oas-spec-native", None, 1)
