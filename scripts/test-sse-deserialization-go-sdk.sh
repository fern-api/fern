#!/usr/bin/env bash
#
# Injects a stricter SSE deserialization test into the go-sdk server-sent-event-examples
# fixture and runs it. The injected test file is .gitignored so it never gets committed.
#
# Usage: ./scripts/test-sse-deserialization-go-sdk.sh
#
set -euo pipefail

FIXTURE_DIR="seed/go-sdk/server-sent-event-examples/with-wire-tests"
TEST_FILE="$FIXTURE_DIR/sse_deserialization_test.go"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

cat > "$TEST_FILE" << 'TESTEOF'
package sse_test

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	sse "github.com/fern-api/sse-examples-go"
	sseClient "github.com/fern-api/sse-examples-go/client"
	"github.com/fern-api/sse-examples-go/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// ─── stream (no discriminator, StreamedCompletion) ──────────────────

func TestStream_OptionalTokensOmitted(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		// Single completion event with optional tokens omitted
		io.WriteString(w, "event: completion\ndata: {\"delta\":\"partial\"}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.Stream(context.Background(), &sse.StreamCompletionRequest{Query: "no-tokens"})
	require.NoError(t, err)
	defer stream.Close()

	event, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "partial", event.Delta)
	assert.Nil(t, event.Tokens, "tokens should be nil when omitted")

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_MultipleEvents(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "event: completion\ndata: {\"delta\":\"foo\",\"tokens\":1}\n\nevent: completion\ndata: {\"delta\":\"bar\",\"tokens\":2}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.Stream(context.Background(), &sse.StreamCompletionRequest{Query: "multi"})
	require.NoError(t, err)
	defer stream.Close()

	event1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "foo", event1.Delta)
	require.NotNil(t, event1.Tokens)
	assert.Equal(t, 1, *event1.Tokens)

	event2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "bar", event2.Delta)
	require.NotNil(t, event2.Tokens)
	assert.Equal(t, 2, *event2.Tokens)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

// ─── streamEvents (discriminator IN data JSON) ──────────────────────

func TestStreamEvents_CompletionAndError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "event: completion\ndata: {\"event\":\"completion\",\"content\":\"hello\"}\n\nevent: error\ndata: {\"event\":\"error\",\"error\":\"oops\",\"code\":500}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEvents(context.Background(), &sse.StreamEventsRequest{Query: "mixed"})
	require.NoError(t, err)
	defer stream.Close()

	// First event: completion
	event1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "completion", event1.Event)
	require.NotNil(t, event1.Completion)
	assert.Equal(t, "hello", event1.Completion.Content)
	assert.Nil(t, event1.Error)

	// Second event: error with optional code present
	event2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "error", event2.Event)
	require.NotNil(t, event2.Error)
	assert.Equal(t, "oops", event2.Error.Error)
	require.NotNil(t, event2.Error.Code)
	assert.Equal(t, 500, *event2.Error.Code)
	assert.Nil(t, event2.Completion)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStreamEvents_EnvelopeDisagreesWithData(t *testing.T) {
	// When the envelope event type disagrees with the data JSON discriminant,
	// the data JSON should win because the discriminator is read from data.
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		// Envelope says "error" but data says "completion"
		io.WriteString(w, "event: error\ndata: {\"event\":\"completion\",\"content\":\"sneaky\"}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEvents(context.Background(), &sse.StreamEventsRequest{Query: "adversarial"})
	require.NoError(t, err)
	defer stream.Close()

	event, err := stream.Recv()
	require.NoError(t, err)
	// Data JSON wins: event=completion, completion variant is populated
	assert.Equal(t, "completion", event.Event)
	require.NotNil(t, event.Completion)
	assert.Equal(t, "sneaky", event.Completion.Content)
	assert.Nil(t, event.Error)
}

// ─── streamEventsContextProtocol (discriminator FROM SSE envelope) ──
//
// In protocol mode, the SSE envelope's event type is the discriminator.
// The generated code uses EventDiscriminant as the field name (instead
// of Event) to avoid collision with the EventEvent variant which has
// its own "event" data field.
//
// These tests are expected to FAIL until the generator properly handles
// the field name collision in StreamEventContextProtocol.

func TestStreamEventsContextProtocol_CompletionAndError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		// Protocol-level: discriminator comes from envelope, NOT from data JSON
		io.WriteString(w, "event: completion\ndata: {\"content\":\"hello\"}\n\nevent: error\ndata: {\"error\":\"boom\",\"code\":503}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEventsContextProtocol(
		context.Background(),
		&sse.StreamEventsContextProtocolRequest{Query: "inject"},
	)
	require.NoError(t, err)
	defer stream.Close()

	// First event: completion variant
	event1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "completion", event1.EventDiscriminant)
	require.NotNil(t, event1.Completion)
	assert.Equal(t, "hello", event1.Completion.Content)
	assert.Nil(t, event1.Error)

	// Second event: error variant with optional code
	event2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "error", event2.EventDiscriminant)
	require.NotNil(t, event2.Error)
	assert.Equal(t, "boom", event2.Error.Error)
	require.NotNil(t, event2.Error.Code)
	assert.Equal(t, 503, *event2.Error.Code)
	assert.Nil(t, event2.Completion)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStreamEventsContextProtocol_EventVariant_NoCollision(t *testing.T) {
	// EventEvent has {event: string, name: string} in its data payload.
	// The envelope discriminator must use a different field (EventDiscriminant)
	// so both the envelope discriminant and the data "event" field are preserved.
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "event: event\ndata: {\"event\":\"update\",\"name\":\"some particular update\"}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEventsContextProtocol(
		context.Background(),
		&sse.StreamEventsContextProtocolRequest{Query: "event-variant"},
	)
	require.NoError(t, err)
	defer stream.Close()

	event, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "event", event.EventDiscriminant)
	require.NotNil(t, event.Event)
	// The data field "event" must be preserved separately from the discriminant
	assert.Equal(t, "update", event.Event.Event)
	assert.Equal(t, "some particular update", event.Event.Name)
	// Ensure discriminant is NOT the same as the data event field
	assert.NotEqual(t, event.EventDiscriminant, event.Event.Event,
		"envelope discriminant and data event field must be separate")
}

func TestStreamEventsContextProtocol_AllThreeVariants(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "event: completion\ndata: {\"content\":\"hello\"}\n\n"+
			"event: error\ndata: {\"error\":\"something went wrong\"}\n\n"+
			"event: event\ndata: {\"event\":\"update\",\"name\":\"some particular update\"}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEventsContextProtocol(
		context.Background(),
		&sse.StreamEventsContextProtocolRequest{Query: "all-variants"},
	)
	require.NoError(t, err)
	defer stream.Close()

	// completion
	e1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "completion", e1.EventDiscriminant)
	require.NotNil(t, e1.Completion)
	assert.Equal(t, "hello", e1.Completion.Content)

	// error
	e2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "error", e2.EventDiscriminant)
	require.NotNil(t, e2.Error)
	assert.Equal(t, "something went wrong", e2.Error.Error)

	// event
	e3, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "event", e3.EventDiscriminant)
	require.NotNil(t, e3.Event)
	assert.Equal(t, "update", e3.Event.Event)
	assert.Equal(t, "some particular update", e3.Event.Name)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStreamEventsContextProtocol_ErrorVariant_OptionalCodeOmitted(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "event: error\ndata: {\"error\":\"no code here\"}\n\n")
	}))
	defer server.Close()

	client := sseClient.NewClient(option.WithBaseURL(server.URL))
	stream, err := client.Completions.StreamEventsContextProtocol(
		context.Background(),
		&sse.StreamEventsContextProtocolRequest{Query: "no-code"},
	)
	require.NoError(t, err)
	defer stream.Close()

	event, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "error", event.EventDiscriminant)
	require.NotNil(t, event.Error)
	assert.Equal(t, "no code here", event.Error.Error)
	assert.Nil(t, event.Error.Code, "optional code should be nil when omitted")
}
TESTEOF

echo "=== Injected test file: $TEST_FILE ==="
echo "=== Running SSE deserialization tests ==="
echo "=== NOTE: streamEventsContextProtocol tests are EXPECTED to fail ==="
echo "=== until the generator fixes the duplicate Event field collision ==="
echo "=== in StreamEventContextProtocol (Event string vs Event *EventEvent) ==="
echo ""

cd "$FIXTURE_DIR"
go test -v -run "TestStream|TestStreamEvents" -count=1 ./...
