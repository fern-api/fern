from .conftest import get_client, verify_request_count


def test__stream_protocol_no_collision() -> None:
    """Test streamProtocolNoCollision endpoint with WireMock"""
    test_id = "stream_protocol_no_collision.0"
    client = get_client(test_id)
    events = list(client.stream_protocol_no_collision())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/protocol-no-collision", None, 1)


def test__stream_protocol_collision() -> None:
    """Test streamProtocolCollision endpoint with WireMock"""
    test_id = "stream_protocol_collision.0"
    client = get_client(test_id)
    events = list(client.stream_protocol_collision())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/protocol-collision", None, 1)


def test__stream_data_context() -> None:
    """Test streamDataContext endpoint with WireMock"""
    test_id = "stream_data_context.0"
    client = get_client(test_id)
    events = list(client.stream_data_context())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/data-context", None, 1)


def test__stream_no_context() -> None:
    """Test streamNoContext endpoint with WireMock"""
    test_id = "stream_no_context.0"
    client = get_client(test_id)
    events = list(client.stream_no_context())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/no-context", None, 1)


def test__stream_protocol_with_flat_schema() -> None:
    """Test streamProtocolWithFlatSchema endpoint with WireMock"""
    test_id = "stream_protocol_with_flat_schema.0"
    client = get_client(test_id)
    events = list(client.stream_protocol_with_flat_schema())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/protocol-with-flat-schema", None, 1)


def test__stream_data_context_with_envelope_schema() -> None:
    """Test streamDataContextWithEnvelopeSchema endpoint with WireMock"""
    test_id = "stream_data_context_with_envelope_schema.0"
    client = get_client(test_id)
    events = list(client.stream_data_context_with_envelope_schema())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/data-context-with-envelope-schema", None, 1)


def test__stream_oas_spec_native() -> None:
    """Test streamOasSpecNative endpoint with WireMock"""
    test_id = "stream_oas_spec_native.0"
    client = get_client(test_id)
    events = list(client.stream_oas_spec_native())
    assert len(events) > 0, "Expected at least one event"
    verify_request_count(test_id, "POST", "/stream/oas-spec-native", None, 1)
