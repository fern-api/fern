from .conftest import get_client, verify_request_count

from seed import StreamXFernStreamingUnionRequest_Message, StreamXFernStreamingUnionStreamRequest_Message


def test__stream_protocol_no_collision() -> None:
    """Test streamProtocolNoCollision endpoint with WireMock"""
    test_id = "stream_protocol_no_collision.0"
    client = get_client(test_id)
    for _ in client.stream_protocol_no_collision():
        pass
    verify_request_count(test_id, "POST", "/stream/protocol-no-collision", None, 1)


def test__stream_protocol_collision() -> None:
    """Test streamProtocolCollision endpoint with WireMock"""
    test_id = "stream_protocol_collision.0"
    client = get_client(test_id)
    for _ in client.stream_protocol_collision():
        pass
    verify_request_count(test_id, "POST", "/stream/protocol-collision", None, 1)


def test__stream_data_context() -> None:
    """Test streamDataContext endpoint with WireMock"""
    test_id = "stream_data_context.0"
    client = get_client(test_id)
    for _ in client.stream_data_context():
        pass
    verify_request_count(test_id, "POST", "/stream/data-context", None, 1)


def test__stream_no_context() -> None:
    """Test streamNoContext endpoint with WireMock"""
    test_id = "stream_no_context.0"
    client = get_client(test_id)
    for _ in client.stream_no_context():
        pass
    verify_request_count(test_id, "POST", "/stream/no-context", None, 1)


def test__stream_protocol_with_flat_schema() -> None:
    """Test streamProtocolWithFlatSchema endpoint with WireMock"""
    test_id = "stream_protocol_with_flat_schema.0"
    client = get_client(test_id)
    for _ in client.stream_protocol_with_flat_schema():
        pass
    verify_request_count(test_id, "POST", "/stream/protocol-with-flat-schema", None, 1)


def test__stream_data_context_with_envelope_schema() -> None:
    """Test streamDataContextWithEnvelopeSchema endpoint with WireMock"""
    test_id = "stream_data_context_with_envelope_schema.0"
    client = get_client(test_id)
    for _ in client.stream_data_context_with_envelope_schema():
        pass
    verify_request_count(test_id, "POST", "/stream/data-context-with-envelope-schema", None, 1)


def test__stream_oas_spec_native() -> None:
    """Test streamOasSpecNative endpoint with WireMock"""
    test_id = "stream_oas_spec_native.0"
    client = get_client(test_id)
    for _ in client.stream_oas_spec_native():
        pass
    verify_request_count(test_id, "POST", "/stream/oas-spec-native", None, 1)


def test__stream_x_fern_streaming_condition_stream() -> None:
    """Test streamXFernStreamingCondition_stream endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_condition_stream.0"
    client = get_client(test_id)
    for _ in client.stream_x_fern_streaming_condition_stream(
        query="query",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-condition", None, 1)


def test__stream_x_fern_streaming_condition() -> None:
    """Test streamXFernStreamingCondition endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_condition.0"
    client = get_client(test_id)
    client.stream_x_fern_streaming_condition(
        query="query",
    )
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-condition", None, 1)


def test__stream_x_fern_streaming_shared_schema_stream() -> None:
    """Test streamXFernStreamingSharedSchema_stream endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_shared_schema_stream.0"
    client = get_client(test_id)
    for _ in client.stream_x_fern_streaming_shared_schema_stream(
        prompt="prompt",
        model="model",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-shared-schema", None, 1)


def test__stream_x_fern_streaming_shared_schema() -> None:
    """Test streamXFernStreamingSharedSchema endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_shared_schema.0"
    client = get_client(test_id)
    client.stream_x_fern_streaming_shared_schema(
        prompt="prompt",
        model="model",
    )
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-shared-schema", None, 1)


def test__validate_completion() -> None:
    """Test validateCompletion endpoint with WireMock"""
    test_id = "validate_completion.0"
    client = get_client(test_id)
    client.validate_completion(
        prompt="prompt",
        model="model",
    )
    verify_request_count(test_id, "POST", "/validate-completion", None, 1)


def test__stream_x_fern_streaming_union_stream() -> None:
    """Test streamXFernStreamingUnion_stream endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_union_stream.0"
    client = get_client(test_id)
    for _ in client.stream_x_fern_streaming_union_stream(
        request=StreamXFernStreamingUnionStreamRequest_Message(
            stream_response=True,
            prompt="prompt",
            message="message",
        ),
    ):
        pass
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-union", None, 1)


def test__stream_x_fern_streaming_union() -> None:
    """Test streamXFernStreamingUnion endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_union.0"
    client = get_client(test_id)
    client.stream_x_fern_streaming_union(
        request=StreamXFernStreamingUnionRequest_Message(
            stream_response=False,
            prompt="prompt",
            message="message",
        ),
    )
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-union", None, 1)


def test__validate_union_request() -> None:
    """Test validateUnionRequest endpoint with WireMock"""
    test_id = "validate_union_request.0"
    client = get_client(test_id)
    client.validate_union_request(
        prompt="prompt",
    )
    verify_request_count(test_id, "POST", "/validate-union-request", None, 1)


def test__stream_x_fern_streaming_nullable_condition_stream() -> None:
    """Test streamXFernStreamingNullableCondition_stream endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_nullable_condition_stream.0"
    client = get_client(test_id)
    for _ in client.stream_x_fern_streaming_nullable_condition_stream(
        query="query",
    ):
        pass
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-nullable-condition", None, 1)


def test__stream_x_fern_streaming_nullable_condition() -> None:
    """Test streamXFernStreamingNullableCondition endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_nullable_condition.0"
    client = get_client(test_id)
    client.stream_x_fern_streaming_nullable_condition(
        query="query",
    )
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-nullable-condition", None, 1)


def test__stream_x_fern_streaming_sse_only() -> None:
    """Test streamXFernStreamingSseOnly endpoint with WireMock"""
    test_id = "stream_x_fern_streaming_sse_only.0"
    client = get_client(test_id)
    for _ in client.stream_x_fern_streaming_sse_only():
        pass
    verify_request_count(test_id, "POST", "/stream/x-fern-streaming-sse-only", None, 1)
