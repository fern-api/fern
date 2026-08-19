package core

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMessage represents a test message for streaming tests.
type TestMessage struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
}

// newSSEServer creates a test HTTP server that responds with the given SSE body.
func newSSEServer(t *testing.T, body string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(body))
	}))
}

// TestStreamMessage represents a more complex test message.
type TestStreamMessage struct {
	Delta  string `json:"delta"`
	Tokens *int   `json:"tokens,omitempty"`
}

func TestSseStreamReader_TerminatorHandling(t *testing.T) {
	tests := []struct {
		desc          string
		sseData       string
		terminator    string
		wantMessages  int
		wantEOFOnRecv bool
		wantRecvError bool
	}{
		{
			desc: "stream with [DONE] terminator",
			sseData: `data: {"content":"Hello","done":false}

data: {"content":" world","done":false}

data: [DONE]

`,
			terminator:    "[DONE]",
			wantMessages:  2,
			wantEOFOnRecv: true,
		},
		{
			desc: "stream with [[DONE]] terminator",
			sseData: `data: {"content":"Test","done":false}

data: [[DONE]]

`,
			terminator:    "[[DONE]]",
			wantMessages:  1,
			wantEOFOnRecv: true,
		},
		{
			desc: "stream with custom terminator",
			sseData: `data: {"content":"First","done":false}

data: {"content":"Second","done":false}

data: END_OF_STREAM

`,
			terminator:    "END_OF_STREAM",
			wantMessages:  2,
			wantEOFOnRecv: true,
		},
		{
			desc: "stream without terminator message",
			sseData: `data: {"content":"Hello","done":true}

`,
			terminator:    "[DONE]",
			wantMessages:  1,
			wantEOFOnRecv: true, // EOF from end of HTTP body
		},
		{
			desc: "stream with no terminator configured",
			sseData: `data: {"content":"Hello","done":false}

data: [DONE]

`,
			terminator:    "", // No terminator configured
			wantMessages:  1,
			wantRecvError: true, // Will try to JSON unmarshal [DONE] and fail
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			var opts []StreamOption
			if test.terminator != "" {
				opts = append(opts, WithTerminator(test.terminator), WithFormat(StreamFormatSSE))
			} else {
				opts = append(opts, WithFormat(StreamFormatSSE))
			}

			stream := NewStream[TestMessage](context.Background(), resp, opts...)
			defer func() { _ = stream.Close() }()

			var messages []TestMessage
			var recvErr error
			for {
				msg, err := stream.Recv()
				if err == io.EOF {
					break
				}
				if err != nil {
					recvErr = err
					break
				}
				messages = append(messages, msg)
			}

			assert.Equal(t, test.wantMessages, len(messages), "Unexpected number of messages received")

			if test.wantRecvError {
				assert.Error(t, recvErr, "Expected Recv() to error")
				assert.Contains(t, recvErr.Error(), "invalid character", "Expected JSON unmarshaling error")
			} else {
				assert.NoError(t, recvErr, "Recv() should not error")
			}
		})
	}
}

func TestStream_RecvRaw(t *testing.T) {
	tests := []struct {
		desc    string
		sseData string
		wantRaw []string
	}{
		{
			desc: "raw bytes without JSON unmarshaling",
			sseData: `data: {"valid":"json"}

data: [INVALID JSON}

data: plain text without quotes

data: {"another":"valid json"}

`,
			wantRaw: []string{
				`{"valid":"json"}`,
				`[INVALID JSON}`,
				`plain text without quotes`,
				`{"another":"valid json"}`,
			},
		},
		{
			desc: "mixed valid and invalid JSON",
			sseData: `data: {"status":"started"}

data: progress: 50%

data: {"status":"completed","result":{"count":42}}

`,
			wantRaw: []string{
				`{"status":"started"}`,
				`progress: 50%`,
				`{"status":"completed","result":{"count":42}}`,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
			defer func() { _ = stream.Close() }()

			var rawMessages []string
			for i := 0; i < len(test.wantRaw); i++ {
				raw, err := stream.RecvRaw()
				require.NoError(t, err)
				rawMessages = append(rawMessages, string(raw))
			}

			// Check for EOF after all expected messages
			_, err = stream.RecvRaw()
			assert.Equal(t, io.EOF, err, "Should receive EOF after all messages")

			assert.Equal(t, test.wantRaw, rawMessages)
		})
	}
}

func TestStream_RecvRawWithTerminator(t *testing.T) {
	sseData := `data: {"message":"first"}

data: {"message":"second"}

data: [DONE]

`

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE), WithTerminator("[DONE]"))
	defer func() { _ = stream.Close() }()

	// Should receive two messages
	raw1, err := stream.RecvRaw()
	require.NoError(t, err)
	assert.Equal(t, `{"message":"first"}`, string(raw1))

	raw2, err := stream.RecvRaw()
	require.NoError(t, err)
	assert.Equal(t, `{"message":"second"}`, string(raw2))

	// Third call should return EOF due to terminator
	_, err = stream.RecvRaw()
	assert.Equal(t, io.EOF, err, "Should receive EOF when terminator is encountered")
}

func TestSseStreamReader_EventParsing(t *testing.T) {
	tests := []struct {
		desc        string
		sseData     string
		wantMessage TestStreamMessage
	}{
		{
			desc: "standard SSE format with space",
			sseData: `data: {"delta":"hello","tokens":5}

`,
			wantMessage: TestStreamMessage{Delta: "hello", Tokens: intPtr(5)},
		},
		{
			desc: "lenient SSE format without space",
			sseData: `data:{"delta":"world","tokens":10}

`,
			wantMessage: TestStreamMessage{Delta: "world", Tokens: intPtr(10)},
		},
		{
			desc: "SSE with event type and id",
			sseData: `event: message
id: 123
data: {"delta":"test"}

`,
			wantMessage: TestStreamMessage{Delta: "test"},
		},
		{
			desc: "multi-line data field",
			sseData: `data: {"delta":"line1\nline2","tokens":3}

`,
			wantMessage: TestStreamMessage{Delta: "line1\nline2", Tokens: intPtr(3)},
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			stream := NewStream[TestStreamMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
			defer func() { _ = stream.Close() }()

			msg, err := stream.Recv()
			require.NoError(t, err)
			assert.Equal(t, test.wantMessage, msg)
		})
	}
}

func TestSseStreamReader_BufferLimits(t *testing.T) {
	// Create a large message that exceeds buffer limits
	largeData := strings.Repeat("x", 100000) // Large data to exceed buffer
	sseData := `data: {"content":"` + largeData + `"}

`

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	// The buffer limit is internal and can't be configured through public API
	// This test validates that very large messages can still be processed
	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	// This should work or error appropriately - the main point is it doesn't panic
	if err != nil {
		// If it errors, it should be a reasonable error
		t.Logf("Large message processing resulted in error (expected): %v", err)
	} else {
		// If it succeeds, verify the content
		assert.Equal(t, largeData, msg.Content)
	}
}

func TestStream_Close(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		// Send one message then wait
		_, _ = w.Write([]byte(`data: {"content":"test"}` + "\n\n"))
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
		// Keep connection open
		<-r.Context().Done()
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))

	// Read one message to ensure stream is working
	_, err = stream.Recv()
	require.NoError(t, err)

	// Close the stream
	err = stream.Close()
	assert.NoError(t, err)

	// Subsequent reads should fail
	_, err = stream.Recv()
	assert.Error(t, err)
}

func TestStream_WithNewlineDelimited(t *testing.T) {
	// Test basic newline-delimited streaming (default behavior)
	customData := `{"content":"first"}
{"content":"second"}
`

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/x-ndjson")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(customData))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	// Use default stream (newline delimited)
	stream := NewStream[TestMessage](context.Background(), resp)
	defer func() { _ = stream.Close() }()

	// Should receive two messages
	msg1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "first", msg1.Content)

	msg2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "second", msg2.Content)

	// Third read should return EOF
	_, err = stream.Recv()
	assert.Equal(t, io.EOF, err)
}

func TestSseStreamReader_CommentLines(t *testing.T) {
	tests := []struct {
		desc         string
		sseData      string
		wantMessages []string
	}{
		{
			desc:         "comment-only event is skipped",
			sseData:      ": this is a heartbeat comment\n\ndata: {\"content\":\"hello\"}\n\n",
			wantMessages: []string{"hello"},
		},
		{
			desc:         "comment lines within data event are ignored",
			sseData:      ": leading comment\ndata: {\"content\":\"first\"}\n\n: standalone heartbeat\n\ndata: {\"content\":\"second\"}\n\n",
			wantMessages: []string{"first", "second"},
		},
		{
			desc:         "multiple consecutive comments",
			sseData:      ": heartbeat 1\n\n: heartbeat 2\n\n: heartbeat 3\n\ndata: {\"content\":\"after-heartbeats\"}\n\n",
			wantMessages: []string{"after-heartbeats"},
		},
		{
			desc:         "comment with no space after colon",
			sseData:      ":no-space-comment\n\ndata: {\"content\":\"works\"}\n\n",
			wantMessages: []string{"works"},
		},
		{
			desc:         "empty comment (just colon)",
			sseData:      ":\n\ndata: {\"content\":\"ok\"}\n\n",
			wantMessages: []string{"ok"},
		},
		{
			desc:         "stream of only comments ends with EOF",
			sseData:      ": comment1\n\n: comment2\n\n",
			wantMessages: nil,
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
			defer func() { _ = stream.Close() }()

			var messages []string
			for {
				msg, err := stream.Recv()
				if err == io.EOF {
					break
				}
				require.NoError(t, err)
				messages = append(messages, msg.Content)
			}

			assert.Equal(t, test.wantMessages, messages)
		})
	}
}

func TestSseStreamReader_LineEndings(t *testing.T) {
	tests := []struct {
		desc         string
		sseData      string
		wantMessages []string
	}{
		{
			desc:         "CRLF line endings",
			sseData:      "data: {\"content\":\"first\"}\r\n\r\ndata: {\"content\":\"second\"}\r\n\r\n",
			wantMessages: []string{"first", "second"},
		},
		{
			desc:         "CR-only line endings",
			sseData:      "data: {\"content\":\"first\"}\r\rdata: {\"content\":\"second\"}\r\r",
			wantMessages: []string{"first", "second"},
		},
		{
			desc:         "mixed LF and CRLF",
			sseData:      "id: 1\r\ndata: {\"content\":\"first\"}\n\ndata: {\"content\":\"second\"}\r\n\r\n",
			wantMessages: []string{"first", "second"},
		},
		{
			desc:         "CRLF with multiple fields",
			sseData:      "id: evt-1\r\nevent: message\r\ndata: {\"content\":\"hello\"}\r\n\r\n",
			wantMessages: []string{"hello"},
		},
		{
			desc:         "CR with comment lines",
			sseData:      ": heartbeat\r\rdata: {\"content\":\"after-cr\"}\r\r",
			wantMessages: []string{"after-cr"},
		},
		{
			desc:         "LF-CR sequence as event boundary",
			sseData:      "data: {\"content\":\"first\"}\n\rdata: {\"content\":\"second\"}\n\r",
			wantMessages: []string{"first", "second"},
		},
		{
			desc:         "multi-line data with CRLF",
			sseData:      "data: {\"content\":\r\ndata: \"hello\"}\r\n\r\n",
			wantMessages: []string{"hello"}, // multi-line data produces {"content":\n"hello"} — valid JSON since whitespace is allowed after ':'
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
			defer func() { _ = stream.Close() }()

			var messages []string
			for {
				msg, err := stream.Recv()
				if err == io.EOF {
					break
				}
				if err != nil {
					break // JSON parse error for invalid multi-line data
				}
				messages = append(messages, msg.Content)
			}

			assert.Equal(t, test.wantMessages, messages)
		})
	}
}

func TestStream_ContextCancellation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte("data: {\"content\":\"first\"}\n\n"))
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
		<-r.Context().Done()
	}))
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](ctx, resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "first", msg.Content)

	cancel()

	done := make(chan struct{})
	go func() {
		_, err := stream.Recv()
		assert.Error(t, err, "Recv should return error after context cancellation")
		close(done)
	}()

	select {
	case <-done:
		// Success
	case <-time.After(5 * time.Second):
		t.Fatal("Recv did not unblock after context cancellation within 5 seconds")
	}
}

func TestStream_HeartbeatOnlyCancellation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		flusher, ok := w.(http.Flusher)
		if !ok {
			return
		}
		for {
			select {
			case <-r.Context().Done():
				return
			default:
				_, _ = w.Write([]byte(": heartbeat\n\n"))
				flusher.Flush()
			}
		}
	}))
	defer server.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](ctx, resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	_, err = stream.Recv()
	assert.Error(t, err, "Recv should error when context is cancelled during heartbeat-only stream")
}

func TestStream_RecvEvent(t *testing.T) {
	tests := []struct {
		desc      string
		sseData   string
		wantID    string
		wantEvent string
		wantRetry int
		wantData  string
	}{
		{
			desc:      "event with id and retry",
			sseData:   "id: evt-123\nretry: 5000\ndata: {\"content\":\"hello\"}\n\n",
			wantID:    "evt-123",
			wantEvent: "",
			wantRetry: 5000,
			wantData:  "hello",
		},
		{
			desc:      "event with event type",
			sseData:   "event: message\nid: 1\ndata: {\"content\":\"typed\"}\n\n",
			wantID:    "1",
			wantEvent: "message",
			wantRetry: 0,
			wantData:  "typed",
		},
		{
			desc:      "event with no metadata",
			sseData:   "data: {\"content\":\"plain\"}\n\n",
			wantID:    "",
			wantEvent: "",
			wantRetry: 0,
			wantData:  "plain",
		},
		{
			desc:      "invalid retry value is ignored",
			sseData:   "retry: not-a-number\ndata: {\"content\":\"ok\"}\n\n",
			wantID:    "",
			wantEvent: "",
			wantRetry: 0,
			wantData:  "ok",
		},
		{
			desc:      "id with null byte is ignored per spec",
			sseData:   "id: has\x00null\ndata: {\"content\":\"ok\"}\n\n",
			wantID:    "",
			wantEvent: "",
			wantRetry: 0,
			wantData:  "ok",
		},
	}

	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			server := newSSEServer(t, test.sseData)
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer func() { _ = resp.Body.Close() }()

			stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
			defer func() { _ = stream.Close() }()

			event, err := stream.RecvEvent()
			require.NoError(t, err)
			assert.Equal(t, test.wantData, event.Data.Content)
			assert.Equal(t, test.wantID, event.ID)
			assert.Equal(t, test.wantEvent, event.Event)
			assert.Equal(t, test.wantRetry, event.Retry)
		})
	}
}

func TestStream_LastEventID(t *testing.T) {
	// Events: id "1", no id (persists "1"), explicit empty id (resets), id "3", null-byte id (ignored, persists "3")
	sseData := "id: 1\ndata: {\"content\":\"first\"}\n\n" +
		"data: {\"content\":\"second\"}\n\n" +
		"id: \ndata: {\"content\":\"third\"}\n\n" +
		"id: 3\ndata: {\"content\":\"fourth\"}\n\n" +
		"id: has\x00null\ndata: {\"content\":\"fifth\"}\n\n"

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	// After first event: LastEventID should be "1"
	_, err = stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "1", stream.LastEventID())

	// After second event (no id): LastEventID should still be "1"
	_, err = stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "1", stream.LastEventID())

	// After third event (explicit empty id): LastEventID should be reset to ""
	_, err = stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "", stream.LastEventID())

	// After fourth event: LastEventID should be "3"
	_, err = stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "3", stream.LastEventID())

	// After fifth event (id with null byte): LastEventID should still be "3"
	_, err = stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "3", stream.LastEventID())
}

func TestStream_LastRetryMs(t *testing.T) {
	// A server may advertise the reconnection time in its own SSE frame (no
	// data:), as the spec recommends. The directive is sticky: it must remain
	// readable via LastRetryMs across subsequent events that carry no retry: of
	// their own, even though those events' per-frame Retry is 0.
	sseData := "retry: 2000\n\n" +
		"data: {\"content\":\"first\"}\n\n" +
		"data: {\"content\":\"second\"}\n\n" +
		"retry: 4000\ndata: {\"content\":\"third\"}\n\n"

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	// Before reading anything, no retry: has been advertised.
	assert.Equal(t, 0, stream.LastRetryMs())

	// First data event: the standalone "retry: 2000" frame was consumed first,
	// so the sticky value is 2000 even though this event carries no retry:.
	event, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "first", event.Data.Content)
	assert.Equal(t, 0, event.Retry)
	assert.Equal(t, 2000, stream.LastRetryMs())

	// Second data event: still no retry:, sticky value unchanged.
	_, err = stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, 2000, stream.LastRetryMs())

	// Third event carries retry: 4000, updating the sticky value.
	_, err = stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, 4000, stream.LastRetryMs())
}

func TestStream_RecvEventRaw(t *testing.T) {
	sseData := "id: abc\nevent: update\nretry: 3000\ndata: not valid json\n\n"

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	event, err := stream.RecvEventRaw()
	require.NoError(t, err)
	assert.Equal(t, "not valid json", string(event.Data))
	assert.Equal(t, "abc", event.ID)
	assert.Equal(t, "update", event.Event)
	assert.Equal(t, 3000, event.Retry)
}

func TestStream_RecvAndRecvEventInterleaved(t *testing.T) {
	sseData := "id: 1\ndata: {\"content\":\"first\"}\n\n" +
		"id: 2\nevent: update\ndata: {\"content\":\"second\"}\n\n" +
		"id: 3\ndata: {\"content\":\"third\"}\n\n"

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp, WithFormat(StreamFormatSSE))
	defer func() { _ = stream.Close() }()

	// Use Recv for first event
	msg1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "first", msg1.Content)
	assert.Equal(t, "1", stream.LastEventID())

	// Use RecvEvent for second event
	event2, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "second", event2.Data.Content)
	assert.Equal(t, "2", event2.ID)
	assert.Equal(t, "update", event2.Event)
	assert.Equal(t, "2", stream.LastEventID())

	// Use Recv for third event
	msg3, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "third", msg3.Content)
	assert.Equal(t, "3", stream.LastEventID())
}

func TestStream_RecvEventWithTerminator(t *testing.T) {
	sseData := "id: 1\ndata: {\"content\":\"first\"}\n\ndata: [DONE]\n\n"

	server := newSSEServer(t, sseData)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer func() { _ = resp.Body.Close() }()

	stream := NewStream[TestMessage](context.Background(), resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
	)
	defer func() { _ = stream.Close() }()

	event, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "first", event.Data.Content)
	assert.Equal(t, "1", event.ID)

	_, err = stream.RecvEvent()
	assert.Equal(t, io.EOF, err)
}

func TestSseStreamReader_InjectDiscriminator(t *testing.T) {
	makeReader := func(field string) *SseStreamReader {
		opts := &streamOptions{eventDiscriminator: field}
		quoted := `"` + field + `"`
		return &SseStreamReader{
			options:                  opts,
			discriminatorQuotedField: []byte(quoted),
			discriminatorKeyCheck:    []byte(quoted + ":"),
			discriminatorKeyCheckSp:  []byte(quoted + " :"),
		}
	}

	tests := []struct {
		desc     string
		field    string
		data     string
		event    string
		expected string
	}{
		{
			desc:     "injects into simple object",
			field:    "type",
			data:     `{"content":"hello"}`,
			event:    "completion",
			expected: `{"type":"completion","content":"hello"}`,
		},
		{
			desc:     "injects into empty object",
			field:    "type",
			data:     `{}`,
			event:    "completion",
			expected: `{"type":"completion"}`,
		},
		{
			desc:     "skips when top-level key exists",
			field:    "type",
			data:     `{"type":"already","content":"hello"}`,
			event:    "completion",
			expected: `{"type":"already","content":"hello"}`,
		},
		{
			desc:     "does NOT skip when key only exists in nested object",
			field:    "type",
			data:     `{"offset":"abc","event":{"type":"user.created","source":"auth0"}}`,
			event:    "user.created",
			expected: `{"type":"user.created","offset":"abc","event":{"type":"user.created","source":"auth0"}}`,
		},
		{
			desc:     "does NOT skip when key only exists in nested array element",
			field:    "type",
			data:     `{"items":[{"type":"inner"}]}`,
			event:    "outer",
			expected: `{"type":"outer","items":[{"type":"inner"}]}`,
		},
		{
			desc:     "skips when top-level key exists alongside nested key",
			field:    "type",
			data:     `{"type":"top","nested":{"type":"inner"}}`,
			event:    "completion",
			expected: `{"type":"top","nested":{"type":"inner"}}`,
		},
		{
			desc:     "handles key with spaces before colon",
			field:    "type",
			data:     `{"type" :"already","content":"hello"}`,
			event:    "completion",
			expected: `{"type" :"already","content":"hello"}`,
		},
		{
			desc:     "does not match key substring in string value",
			field:    "type",
			data:     `{"message":"the \"type\": field is important"}`,
			event:    "completion",
			expected: `{"type":"completion","message":"the \"type\": field is important"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			reader := makeReader(tt.field)
			result := reader.injectDiscriminator([]byte(tt.data), tt.event)
			assert.Equal(t, tt.expected, string(result))
		})
	}
}

// Helper function to create int pointer
func intPtr(i int) *int {
	return &i
}

func TestStream_WithReconnect_ResumesAfterMidStreamEOF(t *testing.T) {
	// Server replies with two events on the first call, then closes the connection
	// before sending the terminator. On the second call (the reconnect), it
	// inspects Last-Event-ID and sends a third event followed by the terminator.
	sentLastEventIDs := make(chan string, 4)
	first := "id: 1\ndata: {\"content\":\"first\"}\n\n" +
		"id: 2\ndata: {\"content\":\"second\"}\n\n"
	second := "id: 3\ndata: {\"content\":\"third\"}\n\n" +
		"data: [DONE]\n\n"

	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		select {
		case sentLastEventIDs <- r.Header.Get("Last-Event-ID"):
		default:
		}
		switch calls {
		case 0:
			_, _ = w.Write([]byte(first))
		case 1:
			_, _ = w.Write([]byte(second))
		}
		calls++
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		if lastEventID != "" {
			req.Header.Set("Last-Event-ID", lastEventID)
		}
		return http.DefaultClient.Do(req)
	}

	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	var got []string
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
		got = append(got, msg.Content)
	}
	assert.Equal(t, []string{"first", "second", "third"}, got)
	close(sentLastEventIDs)
	headers := make([]string, 0, 2)
	for v := range sentLastEventIDs {
		headers = append(headers, v)
	}
	require.Len(t, headers, 2)
	assert.Equal(t, "", headers[0])  // initial request: no Last-Event-ID
	assert.Equal(t, "2", headers[1]) // reconnect carries the most recent ID
}

func TestStream_WithReconnect_RespectsTerminator(t *testing.T) {
	// First (and only) response includes the terminator. Reconnect must NOT fire.
	body := "id: 1\ndata: {\"content\":\"only\"}\n\n" +
		"data: [DONE]\n\n"
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(body))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		t.Fatalf("reconnect must not fire after natural termination; got lastEventID=%q", lastEventID)
		return nil, nil
	}
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "only", msg.Content)
	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
	assert.Equal(t, 1, calls)
}

func TestStream_WithReconnect_HonorsMaxAttempts(t *testing.T) {
	// The max-attempts cap applies to CONSECUTIVE reconnects without progress.
	// Each successfully dispatched event resets the counter. This test verifies
	// that when no progress is made (server sends no events on reconnect), the
	// cap is enforced.
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		if calls == 1 {
			// Initial: send one event, then close without terminator.
			_, _ = w.Write([]byte("id: 1\ndata: {\"content\":\"x\"}\n\n"))
		}
		// Reconnects: send nothing (immediate close) → no progress.
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		if lastEventID != "" {
			req.Header.Set("Last-Event-ID", lastEventID)
		}
		return http.DefaultClient.Do(req)
	}
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 2),
	)
	defer func() { _ = stream.Close() }()

	var got []string
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
		got = append(got, msg.Content)
	}
	assert.Equal(t, []string{"x"}, got)
	// 1 initial call + 2 reconnect attempts (both yield nothing) = 3 total
	assert.Equal(t, 3, calls)
}

func TestStream_WithReconnect_ResetsOnProgress(t *testing.T) {
	// Verify the reconnect counter resets when progress is made: a server
	// that sends one event per connection can reconnect indefinitely.
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		id := calls
		_, _ = fmt.Fprintf(w, "id: %d\ndata: {\"content\":\"msg-%d\"}\n\n", id, id)
		if calls >= 4 {
			// After 4 connections, send the terminator to end.
			_, _ = w.Write([]byte("data: [DONE]\n\n"))
		}
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		if lastEventID != "" {
			req.Header.Set("Last-Event-ID", lastEventID)
		}
		return http.DefaultClient.Do(req)
	}
	// maxAttempts=2, but because each reconnect makes progress (yields an
	// event), the counter resets and we can reconnect more than 2 times total.
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 2),
	)
	defer func() { _ = stream.Close() }()

	var got []string
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
		got = append(got, msg.Content)
	}
	assert.Equal(t, []string{"msg-1", "msg-2", "msg-3", "msg-4"}, got)
	assert.Equal(t, 4, calls) // 1 initial + 3 reconnects (all made progress)
}

func TestStream_WithReconnect_NoTerminatorNoReconnect(t *testing.T) {
	// When no terminator is configured, the client cannot distinguish a
	// completed stream from a dropped connection. Reconnection must NOT fire.
	body := "id: 1\ndata: {\"content\":\"only\"}\n\n"
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(body))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		t.Fatal("reconnect must not fire when no terminator is configured")
		return nil, nil
	}
	// No WithTerminator — terminator is empty string.
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "only", msg.Content)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
	assert.Equal(t, 1, calls)
}

func TestStream_WithReconnect_DefaultBackoff(t *testing.T) {
	// Without a server-sent retry: directive, the default minimum backoff
	// of 1s should be applied between reconnects.
	var calls int
	var callTimes []time.Time
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		callTimes = append(callTimes, time.Now())
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		if calls == 1 {
			_, _ = w.Write([]byte("id: 1\ndata: {\"content\":\"first\"}\n\n"))
		} else {
			_, _ = w.Write([]byte("data: [DONE]\n\n"))
		}
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		return http.DefaultClient.Do(req)
	}
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	for {
		_, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
	}
	require.Equal(t, 2, calls)
	// The reconnect call should have been delayed by at least 900ms
	// (allowing some slack for timer imprecision).
	elapsed := callTimes[1].Sub(callTimes[0])
	assert.GreaterOrEqual(t, elapsed, 900*time.Millisecond,
		"reconnect should be delayed by at least ~1s (got %v)", elapsed)
}

func TestStream_WithReconnect_ServerRetryRespectedAndClamped(t *testing.T) {
	// Verify that a server-sent retry: directive overrides the default delay,
	// and that unreasonably large values are clamped to maxReconnectBackoff.
	var calls int
	var callTimes []time.Time
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		callTimes = append(callTimes, time.Now())
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		if calls == 1 {
			// Advertise a 100ms retry (much shorter than default 1s).
			_, _ = w.Write([]byte("retry: 100\nid: 1\ndata: {\"content\":\"first\"}\n\n"))
		} else {
			_, _ = w.Write([]byte("data: [DONE]\n\n"))
		}
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		return http.DefaultClient.Do(req)
	}
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	for {
		_, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
	}
	require.Equal(t, 2, calls)
	// The retry: 100 should be honored (≈100ms, definitely < 900ms).
	elapsed := callTimes[1].Sub(callTimes[0])
	assert.Less(t, elapsed, 900*time.Millisecond,
		"retry: 100 should result in ~100ms delay, not the default 1s (got %v)", elapsed)
	assert.GreaterOrEqual(t, elapsed, 80*time.Millisecond,
		"retry delay should be at least ~100ms (got %v)", elapsed)
}

func TestStream_WithReconnect_MidEventDropResumesFromLastDispatched(t *testing.T) {
	// Critical regression test: if the connection drops after an `id:` line
	// is parsed but before that event's terminating blank line, reconnection
	// must use the LAST DISPATCHED id (evt-1), NOT the parsed-but-undispatched
	// id (evt-2). Otherwise, the server resumes after evt-2 and evt-2 is lost.
	var calls int
	sentLastEventIDs := make(chan string, 4)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		select {
		case sentLastEventIDs <- r.Header.Get("Last-Event-ID"):
		default:
		}
		switch calls {
		case 1:
			// Deliver evt-1 fully, then start evt-2 but drop mid-event
			// (id parsed, no data/blank line).
			_, _ = w.Write([]byte("id: evt-1\ndata: {\"content\":\"first\"}\n\nid: evt-2\n"))
		case 2:
			// Resume: server sends evt-2 and evt-3, then terminates.
			_, _ = w.Write([]byte("id: evt-2\ndata: {\"content\":\"second\"}\n\nid: evt-3\ndata: {\"content\":\"third\"}\n\ndata: [DONE]\n\n"))
		}
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		if lastEventID != "" {
			req.Header.Set("Last-Event-ID", lastEventID)
		}
		return http.DefaultClient.Do(req)
	}
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 3),
	)
	defer func() { _ = stream.Close() }()

	var got []string
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
		got = append(got, msg.Content)
	}
	// All three events must be delivered without loss.
	assert.Equal(t, []string{"first", "second", "third"}, got)

	close(sentLastEventIDs)
	headers := make([]string, 0, 2)
	for v := range sentLastEventIDs {
		headers = append(headers, v)
	}
	require.Len(t, headers, 2)
	assert.Equal(t, "", headers[0])      // initial: no Last-Event-ID
	assert.Equal(t, "evt-1", headers[1]) // reconnect uses last DISPATCHED id, not "evt-2"
}

func TestStream_WithReconnect_CancellationDuringBackoff(t *testing.T) {
	// Cancelling the context during the backoff delay must stop promptly
	// and NOT issue another request.
	var calls int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt32(&calls, 1)
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte("id: 1\ndata: {\"content\":\"hello\"}\n\n"))
	}))
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL, nil)
		if err != nil {
			return nil, err
		}
		return http.DefaultClient.Do(req)
	}
	stream := NewStream[TestMessage](
		ctx,
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 5),
	)
	defer func() { _ = stream.Close() }()

	// Read the initial event.
	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "hello", msg.Content)

	// Cancel the context right before the next Recv would trigger a reconnect
	// (the stream will see EOF, enter backoff, and we cancel during the delay).
	go func() {
		time.Sleep(100 * time.Millisecond)
		cancel()
	}()

	start := time.Now()
	_, err = stream.Recv()
	elapsed := time.Since(start)
	// Should return quickly (within ~200ms of the cancel, not the full 1s backoff).
	assert.Error(t, err)
	assert.Less(t, elapsed, 500*time.Millisecond,
		"cancellation during backoff should resolve promptly (got %v)", elapsed)
	// Only the initial call should have been made.
	assert.Equal(t, int32(1), atomic.LoadInt32(&calls))
}

func TestStream_WithReconnect_FailedReconnectConsumesAttempt(t *testing.T) {
	// When the reconnect function returns an error, it should consume an
	// attempt and retry (rather than surfacing the error to the caller).
	var calls int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte("id: 1\ndata: {\"content\":\"hello\"}\n\n"))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	var reconnectCalls int
	reconnect := func(ctx context.Context, lastEventID string) (*http.Response, error) {
		reconnectCalls++
		if reconnectCalls <= 2 {
			return nil, errors.New("transient failure")
		}
		// Third reconnect succeeds and terminates.
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL+"/done", nil)
		if err != nil {
			return nil, err
		}
		return http.DefaultClient.Do(req)
	}

	// Set up a second handler for the /done path.
	server.Config.Handler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/done" {
			w.Header().Set("Content-Type", "text/event-stream")
			w.WriteHeader(200)
			_, _ = w.Write([]byte("id: 2\ndata: {\"content\":\"resumed\"}\n\ndata: [DONE]\n\n"))
			return
		}
		calls++
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte("id: 1\ndata: {\"content\":\"hello\"}\n\n"))
	})

	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(reconnect, 5),
	)
	defer func() { _ = stream.Close() }()

	var got []string
	for {
		msg, err := stream.Recv()
		if err == io.EOF {
			break
		}
		require.NoError(t, err)
		got = append(got, msg.Content)
	}
	assert.Equal(t, []string{"hello", "resumed"}, got)
	// 2 failed + 1 successful reconnect = 3 total reconnect calls.
	assert.Equal(t, 3, reconnectCalls)
}

func TestStream_WithReconnect_DisableStreamReconnection(t *testing.T) {
	// When DisableStreamReconnection is set (reconnectFn is not passed to
	// WithReconnect), reconnection should never fire.
	body := "id: 1\ndata: {\"content\":\"only\"}\n\n"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		_, _ = w.Write([]byte(body))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	// No WithReconnect option → reconnectFn is nil.
	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "only", msg.Content)

	// EOF without terminator — but no reconnect since it's disabled.
	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_WithReconnect_NoEventID_NoReconnect(t *testing.T) {
	// When events carry no id: field, the stream must not reconnect on EOF
	// because reconnecting with an empty Last-Event-ID would replay the
	// entire stream (duplicate events). This matches TS shouldReconnect's
	// `if (lastId == null || lastId === "") return false` guard.
	var reconnectCalls int
	body := "data: {\"content\":\"no-id-event\"}\n\n"
	server := newSSEServer(t, body)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(func(_ context.Context, _ string) (*http.Response, error) {
			reconnectCalls++
			return http.Get(server.URL)
		}, 3),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "no-id-event", msg.Content)

	// EOF without terminator — but no id was ever dispatched, so reconnect
	// must not fire (it would replay from the beginning).
	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
	assert.Equal(t, 0, reconnectCalls, "must not reconnect when no event ID was dispatched")
}

func TestStream_WithReconnect_NilResponse(t *testing.T) {
	// A reconnectFn that returns (nil, nil) must not panic.
	body := "id: 1\ndata: {\"content\":\"before-drop\"}\n\n"
	server := newSSEServer(t, body)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(func(_ context.Context, _ string) (*http.Response, error) {
			return nil, nil // common stub/wrapper mistake
		}, 2),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "before-drop", msg.Content)

	// Should not panic; should exhaust attempts and return EOF.
	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_WithReconnect_RespBodyLeakOnError(t *testing.T) {
	// When reconnectFn returns (resp, err) with both non-nil, the body
	// must be closed to avoid leaking connections.
	body := "id: 1\ndata: {\"content\":\"first\"}\n\n"
	server := newSSEServer(t, body)
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](
		context.Background(),
		resp,
		WithFormat(StreamFormatSSE),
		WithTerminator("[DONE]"),
		WithReconnect(func(_ context.Context, _ string) (*http.Response, error) {
			return &http.Response{
				Body: io.NopCloser(strings.NewReader("")),
			}, errors.New("simulated error")
		}, 1),
	)
	defer func() { _ = stream.Close() }()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "first", msg.Content)

	// Should handle the (resp, err) case gracefully.
	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}
