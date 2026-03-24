#!/usr/bin/env bash
#
# Injects a stricter SSE deserialization test into the python-sdk server-sent-event-examples
# fixture and runs it. The injected test file is gitignored so it doesn't pollute the seed
# fixture output.
#
# Usage: ./scripts/test-sse-deserialization-python-sdk.sh
#
set -euo pipefail

FIXTURE_DIR="seed/python-sdk/server-sent-event-examples/with-wire-tests"
TEST_FILE="$FIXTURE_DIR/tests/wire/test_sse_deserialization.py"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

cat > "$TEST_FILE" << 'TESTEOF'
"""
Stricter SSE deserialization tests for the Python SDK.

These tests verify that the SDK correctly deserializes SSE events, including
edge cases around discriminator handling for context-protocol streams.

Unlike the auto-generated wire tests (which only verify request round-trips
via WireMock), these tests assert the actual deserialized values returned
by the SDK client.

A lightweight in-process HTTP server is used (instead of WireMock) so each
test can define its own raw SSE response body.
"""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Dict, List, Optional

from seed.client import SeedServerSentEvents


# ---------------------------------------------------------------------------
# Lightweight SSE mock server
# ---------------------------------------------------------------------------

class _SSEHandler(BaseHTTPRequestHandler):
    """Serves a canned SSE response body configured via the server instance."""

    def do_POST(self) -> None:
        # Read and discard the request body
        content_length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(content_length)

        path = self.path
        routes: Dict[str, str] = getattr(self.server, "_sse_routes", {})

        if path in routes:
            body = routes[path].encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    # Suppress request logging to keep test output clean
    def log_message(self, format: str, *args: Any) -> None:
        pass


class SSEMockServer:
    """A tiny HTTP server that returns pre-configured SSE response bodies."""

    def __init__(self) -> None:
        self._server = HTTPServer(("127.0.0.1", 0), _SSEHandler)
        self._server._sse_routes = {}  # type: ignore[attr-defined]
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()

    @property
    def base_url(self) -> str:
        host, port = self._server.server_address
        return f"http://{host}:{port}"

    def route(self, path: str, sse_body: str) -> None:
        """Register a route that returns the given raw SSE body."""
        self._server._sse_routes[path] = sse_body  # type: ignore[attr-defined]

    def shutdown(self) -> None:
        self._server.shutdown()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _collect_events(iterator) -> List[Any]:
    """Drain an iterator into a list."""
    return list(iterator)


def _to_dict(obj: Any) -> Any:
    """Convert a Pydantic model (or primitive) to a plain dict for assertions."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump(exclude_none=True, exclude_unset=True)
    if hasattr(obj, "dict"):
        # Pydantic v1 fallback
        d = obj.dict(exclude_none=True, exclude_unset=True)
        return d
    return obj


# ---------------------------------------------------------------------------
# Tests: stream (no discriminator, StreamedCompletion)
# ---------------------------------------------------------------------------

def test_stream_optional_tokens_omitted() -> None:
    """stream: optional tokens omitted — should still parse correctly."""
    server = SSEMockServer()
    try:
        server.route("/stream", 'event: completion\ndata: {"delta":"partial"}\n\n')
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(client.completions.stream(query="no-tokens"))
        assert len(events) == 1
        d = _to_dict(events[0])
        assert d["delta"] == "partial"
        assert "tokens" not in d
    finally:
        server.shutdown()


# ---------------------------------------------------------------------------
# Tests: streamEvents (discriminator IN data JSON)
# ---------------------------------------------------------------------------

def test_stream_events_error_variant_with_optional_code() -> None:
    """streamEvents: error variant with optional code present."""
    server = SSEMockServer()
    try:
        sse_body = (
            'event: completion\ndata: {"event":"completion","content":"hello"}\n\n'
            'event: error\ndata: {"event":"error","error":"oops","code":500}\n\n'
        )
        server.route("/stream-events", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(client.completions.stream_events(query="mixed"))
        assert len(events) == 2
        d0 = _to_dict(events[0])
        assert d0["event"] == "completion"
        assert d0["content"] == "hello"
        d1 = _to_dict(events[1])
        assert d1["event"] == "error"
        assert d1["error"] == "oops"
        assert d1["code"] == 500
    finally:
        server.shutdown()


def test_stream_events_envelope_disagrees_with_data_discriminator() -> None:
    """streamEvents: envelope disagrees with data discriminator — data JSON wins."""
    server = SSEMockServer()
    try:
        # Envelope says "error" but data JSON discriminator says "completion"
        sse_body = 'event: error\ndata: {"event":"completion","content":"sneaky"}\n\n'
        server.route("/stream-events", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(client.completions.stream_events(query="adversarial"))
        assert len(events) == 1
        d = _to_dict(events[0])
        # Data JSON discriminator should win over envelope
        assert d["event"] == "completion"
        assert d["content"] == "sneaky"
    finally:
        server.shutdown()


# ---------------------------------------------------------------------------
# Tests: streamEventsContextProtocol (discriminator FROM SSE envelope)
#
# In protocol mode the discriminator comes from the SSE envelope's
# `event:` line, not from a field in the JSON `data:` payload.
#
# The SDK exposes discriminated-union types for users to work with:
#   StreamEventContextProtocol_Completion
#   StreamEventContextProtocol_Error
#   StreamEventContextProtocol_Event
#
# A typical user would iterate over the stream, use isinstance() to
# determine which variant they received, then access variant-specific
# fields.  The tests below mirror that standard usage pattern.
#
# Known generator bugs exposed by these tests:
#
# 1. The raw client deserializes into the *base* types (CompletionEvent,
#    ErrorEvent, EventEvent) instead of the StreamEventContextProtocol_*
#    union variants.  isinstance() checks against the public API types
#    therefore fail.
#
# 2. StreamEventContextProtocol_Event defines `event: Literal["event"]`
#    which collides with EventEvent.event (a freeform string from the
#    data payload).  If the generator were fixed to parse into the
#    wrapper type, the data payload's `event` value (e.g. "update")
#    would be overwritten by the literal "event".
#
# These tests are expected to FAIL until the generator is fixed.
# ---------------------------------------------------------------------------

from seed.completions.types.stream_event_context_protocol import (
    StreamEventContextProtocol_Completion,
    StreamEventContextProtocol_Error,
    StreamEventContextProtocol_Event,
)
from seed.completions.types.completion_event import CompletionEvent
from seed.completions.types.error_event import ErrorEvent
from seed.completions.types.event_event import EventEvent


def test_context_protocol_isinstance_completion() -> None:
    """User checks isinstance against the public union variant type."""
    server = SSEMockServer()
    try:
        sse_body = 'event: completion\ndata: {"content":"hello"}\n\n'
        server.route("/stream-events-context-protocol", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(
            client.completions.stream_events_context_protocol(query="check-type")
        )
        assert len(events) == 1
        event = events[0]

        # A user would naturally write this — it should pass:
        assert isinstance(event, StreamEventContextProtocol_Completion), (
            f"Expected StreamEventContextProtocol_Completion but got {type(event).__name__}. "
            "The raw client yields CompletionEvent (a base type) instead of the "
            "public union variant type."
        )
        assert event.content == "hello"
    finally:
        server.shutdown()


def test_context_protocol_isinstance_error() -> None:
    """User checks isinstance against the public union variant type."""
    server = SSEMockServer()
    try:
        sse_body = 'event: error\ndata: {"error":"boom","code":503}\n\n'
        server.route("/stream-events-context-protocol", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(
            client.completions.stream_events_context_protocol(query="check-type")
        )
        assert len(events) == 1
        event = events[0]

        assert isinstance(event, StreamEventContextProtocol_Error), (
            f"Expected StreamEventContextProtocol_Error but got {type(event).__name__}. "
            "The raw client yields ErrorEvent (a base type) instead of the "
            "public union variant type."
        )
        assert event.error == "boom"
        assert event.code == 503
    finally:
        server.shutdown()


def test_context_protocol_isinstance_event() -> None:
    """User checks isinstance against the public union variant type."""
    server = SSEMockServer()
    try:
        sse_body = 'event: event\ndata: {"event":"update","name":"some particular update"}\n\n'
        server.route("/stream-events-context-protocol", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(
            client.completions.stream_events_context_protocol(query="check-type")
        )
        assert len(events) == 1
        event = events[0]

        assert isinstance(event, StreamEventContextProtocol_Event), (
            f"Expected StreamEventContextProtocol_Event but got {type(event).__name__}. "
            "The raw client yields EventEvent (a base type) instead of the "
            "public union variant type."
        )
        assert event.name == "some particular update"
    finally:
        server.shutdown()


def test_context_protocol_discriminator_field_present() -> None:
    """
    All variants should have an `event` discriminator field so users can
    branch without isinstance:

        for item in client.completions.stream_events_context_protocol(...):
            if item.event == "completion":
                print(item.content)
            elif item.event == "error":
                print(item.error)
            elif item.event == "event":
                print(item.name)
    """
    server = SSEMockServer()
    try:
        sse_body = (
            'event: completion\ndata: {"content":"hello"}\n\n'
            'event: error\ndata: {"error":"something went wrong"}\n\n'
            'event: event\ndata: {"event":"update","name":"some particular update"}\n\n'
        )
        server.route("/stream-events-context-protocol", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(
            client.completions.stream_events_context_protocol(query="all-variants")
        )
        assert len(events) == 3

        # Each event should have an `event` discriminator populated from
        # the SSE envelope, matching the literal values defined on the
        # StreamEventContextProtocol_* types.
        assert hasattr(events[0], "event"), (
            f"Completion variant has no 'event' attribute — got {type(events[0]).__name__} "
            f"with fields {_to_dict(events[0])}. The base type CompletionEvent doesn't "
            "include a discriminator field."
        )
        assert events[0].event == "completion"
        assert events[0].content == "hello"

        assert hasattr(events[1], "event"), (
            f"Error variant has no 'event' attribute — got {type(events[1]).__name__} "
            f"with fields {_to_dict(events[1])}. The base type ErrorEvent doesn't "
            "include a discriminator field."
        )
        assert events[1].event == "error"
        assert events[1].error == "something went wrong"

        assert events[2].event == "event"
        assert events[2].name == "some particular update"
    finally:
        server.shutdown()


def test_context_protocol_event_variant_discriminator_collides_with_data_field() -> None:
    """
    StreamEventContextProtocol_Event defines `event: Literal["event"]`,
    but EventEvent has `event: str` — a freeform value from the data
    payload (e.g. "update").

    If you try to parse data with event="update" into
    StreamEventContextProtocol_Event, pydantic will reject it because
    "update" doesn't match Literal["event"].

    This test directly attempts that parse to show the collision is real:
    the wrapper type cannot represent data where the payload's `event`
    field differs from the envelope variant name.
    """
    import pydantic

    data_from_server = {"event": "update", "name": "some particular update"}

    # Parsing as EventEvent works — it accepts any string for `event`
    event_event = EventEvent.model_validate(data_from_server)
    assert event_event.event == "update"
    assert event_event.name == "some particular update"

    # Parsing as StreamEventContextProtocol_Event should work AND
    # preserve the data payload's event value.  This is what the
    # generator needs to support — the wrapper type must be able to
    # hold both the envelope discriminator and the data field.
    wrapper = StreamEventContextProtocol_Event.model_validate(data_from_server)
    assert wrapper.name == "some particular update"
    assert wrapper.event == "update", (
        f"StreamEventContextProtocol_Event should preserve the data payload's "
        f"'event' field ('update'), but got '{wrapper.event}'.  "
        f"The Literal['event'] discriminator on StreamEventContextProtocol_Event "
        f"collides with EventEvent.event — the type cannot represent data where "
        f"the payload's event field differs from the envelope variant name."
    )


def test_context_protocol_error_variant_optional_code_omitted() -> None:
    """Error variant with optional code omitted — field should be absent."""
    server = SSEMockServer()
    try:
        sse_body = 'event: error\ndata: {"error":"no code here"}\n\n'
        server.route("/stream-events-context-protocol", sse_body)
        client = SeedServerSentEvents(base_url=server.base_url)
        events = _collect_events(
            client.completions.stream_events_context_protocol(query="no-code")
        )
        assert len(events) == 1
        event = events[0]

        assert isinstance(event, StreamEventContextProtocol_Error), (
            f"Expected StreamEventContextProtocol_Error but got {type(event).__name__}"
        )
        assert event.error == "no code here"
        assert event.code is None
    finally:
        server.shutdown()
TESTEOF

cleanup() {
    echo ""
    echo "=== Cleaning up ==="
    # Stop WireMock container if the conftest started one
    COMPOSE_FILE="$REPO_ROOT/$FIXTURE_DIR/wiremock/docker-compose.test.yml"
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f "$COMPOSE_FILE" -p seed-server-sent-events down -v 2>/dev/null || true
    fi
    echo "=== Cleanup complete ==="
}
trap cleanup EXIT

echo "=== Injected test file: $TEST_FILE ==="
echo "=== Installing dependencies ==="
cd "$FIXTURE_DIR"
poetry install 2>&1

echo ""
echo "=== Running SSE deserialization tests ==="
echo "=== NOTE: streamEventsContextProtocol tests are EXPECTED to fail ==="
echo "=== They assert that the SDK returns StreamEventContextProtocol_* types ==="
echo "=== (not base types) and that the discriminator field is present ==="
echo ""
poetry run pytest tests/wire/test_sse_deserialization.py -v
