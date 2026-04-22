package core

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
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

// newReconnectSSEStream creates a Stream[T] from raw SSE text for reconnection tests.
func newReconnectSSEStream[T any](ctx context.Context, body string) *Stream[T] {
	resp := &http.Response{
		StatusCode: 200,
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     http.Header{"Content-Type": []string{"text/event-stream"}},
	}
	return NewStream[T](ctx, resp,
		WithFormat(StreamFormatSSE),
		WithPrefix("data: "),
	)
}

func TestStream_TransparentReconnection(t *testing.T) {
	ctx := context.Background()
	callCount := 0

	initial := newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"hello\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		callCount++
		if callCount == 1 {
			return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"world\",\"done\":true}\n\n"), nil
		}
		return newReconnectSSEStream[TestMessage](ctx, ""), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	msg1, err := initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "hello", msg1.Content)

	msg2, err := initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "world", msg2.Content)

	assert.Equal(t, 1, callCount, "should have reconnected once")
}

func TestStream_LastEventIDSentOnReconnect(t *testing.T) {
	ctx := context.Background()
	var receivedLastEventID string

	initial := newReconnectSSEStream[TestMessage](ctx, "id: evt-42\ndata: {\"content\":\"before\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		receivedLastEventID = lastEventID
		return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"after\",\"done\":true}\n\n"), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	event1, err := initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "before", event1.Data.Content)
	assert.Equal(t, "evt-42", initial.LastEventID())

	_, err = initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "evt-42", receivedLastEventID)
}

func TestStream_MaxReconnectAttemptsExhausted(t *testing.T) {
	ctx := context.Background()
	attempts := 0

	initial := newReconnectSSEStream[TestMessage](ctx, "")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		attempts++
		return nil, io.ErrUnexpectedEOF
	}, 1)
	defer func() { _ = initial.Close() }()

	_, err := initial.Recv()
	require.Error(t, err)

	var reconnectErr *ReconnectError
	require.ErrorAs(t, err, &reconnectErr)
	assert.Equal(t, 1, reconnectErr.Attempts)
	assert.Equal(t, 1, attempts)
}

func TestStream_ReconnectDisabledWithZeroAttempts(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		t.Fatal("reconnect should not be called")
		return nil, nil
	}, 0)
	defer func() { _ = initial.Close() }()

	_, err := initial.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_ReconnectContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())

	initial := newReconnectSSEStream[TestMessage](ctx, "")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		cancel()
		return nil, io.ErrUnexpectedEOF
	}, 10)
	defer func() { _ = initial.Close() }()

	_, err := initial.Recv()
	assert.ErrorIs(t, err, context.Canceled)
}

func TestStream_CloseStopsReconnection(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		return nil, io.ErrUnexpectedEOF
	}, 10)

	go func() {
		time.Sleep(50 * time.Millisecond)
		_ = initial.Close()
	}()

	_, err := initial.Recv()
	assert.Error(t, err)
}

func TestStream_TerminatorStopsReconnection(t *testing.T) {
	ctx := context.Background()

	resp := &http.Response{
		StatusCode: 200,
		Body:       io.NopCloser(strings.NewReader("data: {\"content\":\"hi\",\"done\":false}\n\ndata: [DONE]\n\n")),
		Header:     http.Header{"Content-Type": []string{"text/event-stream"}},
	}
	initial := NewStream[TestMessage](ctx, resp,
		WithFormat(StreamFormatSSE),
		WithPrefix("data: "),
		WithTerminator("[DONE]"),
	)
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		t.Fatal("reconnect should not be called after terminator")
		return nil, nil
	}, 10)
	defer func() { _ = initial.Close() }()

	msg, err := initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "hi", msg.Content)

	_, err = initial.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_JSONUnmarshalErrorNotRetryable(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "data: not-valid-json\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		t.Fatal("reconnect should not be called for JSON errors")
		return nil, nil
	}, 10)
	defer func() { _ = initial.Close() }()

	_, err := initial.Recv()
	require.Error(t, err)
	var reconnectErr *ReconnectError
	assert.False(t, errors.As(err, &reconnectErr))
}

func TestStream_ServerRetryPersistsAcrossReconnections(t *testing.T) {
	ctx := context.Background()
	callCount := 0

	initial := newReconnectSSEStream[TestMessage](ctx, "retry: 2000\ndata: {\"content\":\"first\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		callCount++
		return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"resumed\",\"done\":true}\n\n"), nil
	}, 3)
	defer func() { _ = initial.Close() }()

	event, err := initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "first", event.Data.Content)
	assert.Equal(t, 2000, event.Retry)

	event2, err := initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "resumed", event2.Data.Content)
	assert.Equal(t, 1, callCount, "should have reconnected once")
}

func TestStream_CloseThenRecv(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"hello\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		t.Fatal("reconnect should not be called after close")
		return nil, nil
	}, 10)

	require.NoError(t, initial.Close())

	_, err := initial.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestStream_MultipleConsecutiveReconnections(t *testing.T) {
	ctx := context.Background()
	reconnectCount := 0

	// First connection: one message then EOF triggers reconnect.
	initial := newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"a\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		reconnectCount++
		switch reconnectCount {
		case 1:
			// Second connection: one message then EOF triggers another reconnect.
			return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"b\",\"done\":false}\n\n"), nil
		case 2:
			// Third connection: final message.
			return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"c\",\"done\":true}\n\n"), nil
		default:
			return newReconnectSSEStream[TestMessage](ctx, ""), nil
		}
	}, 10)
	defer func() { _ = initial.Close() }()

	msgs := make([]string, 0, 3)
	for i := 0; i < 3; i++ {
		msg, err := initial.Recv()
		require.NoError(t, err)
		msgs = append(msgs, msg.Content)
	}
	assert.Equal(t, []string{"a", "b", "c"}, msgs)
	assert.Equal(t, 2, reconnectCount, "should have reconnected twice")
}

func TestStream_RecvRawWithReconnection(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"first\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"second\",\"done\":true}\n\n"), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	raw1, err := initial.RecvRaw()
	require.NoError(t, err)
	assert.Contains(t, string(raw1), "first")

	raw2, err := initial.RecvRaw()
	require.NoError(t, err)
	assert.Contains(t, string(raw2), "second")
}

func TestStream_RecvEventRawWithReconnection(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "id: e1\ndata: {\"content\":\"one\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		return newReconnectSSEStream[TestMessage](ctx, "id: e2\ndata: {\"content\":\"two\",\"done\":true}\n\n"), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	event1, err := initial.RecvEventRaw()
	require.NoError(t, err)
	assert.Contains(t, string(event1.Data), "one")
	assert.Equal(t, "e1", event1.ID)

	event2, err := initial.RecvEventRaw()
	require.NoError(t, err)
	assert.Contains(t, string(event2.Data), "two")
	assert.Equal(t, "e2", event2.ID)
}

func TestBackoffDelay(t *testing.T) {
	// Attempt 0: base delay (500ms ± 10%).
	d0 := backoffDelay(0, 0)
	assert.InDelta(t, float64(500*time.Millisecond), float64(d0), float64(50*time.Millisecond)+1)

	// Attempt 3: 500ms * 2^3 = 4s ± 10%.
	d3 := backoffDelay(3, 0)
	assert.InDelta(t, float64(4*time.Second), float64(d3), float64(400*time.Millisecond)+1)

	// High attempt: capped at maxReconnectDelay (30s ± 10%).
	d100 := backoffDelay(100, 0)
	assert.InDelta(t, float64(30*time.Second), float64(d100), float64(3*time.Second)+1)

	// Server retry overrides base.
	d0sr := backoffDelay(0, 2*time.Second)
	assert.InDelta(t, float64(2*time.Second), float64(d0sr), float64(200*time.Millisecond)+1)
}

func TestIsRetryableStreamError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{"EOF", io.EOF, true},
		{"UnexpectedEOF", io.ErrUnexpectedEOF, true},
		{"net.Error timeout", &net.DNSError{IsTimeout: true}, true},
		{"json.SyntaxError", &json.SyntaxError{}, false},
		{"json.UnmarshalTypeError", &json.UnmarshalTypeError{}, false},
		{"unknown error defaults to non-retryable", errors.New("application error"), false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, isRetryableStreamError(tt.err))
		})
	}
}

func TestStream_ReconnectSucceedsOnThirdAttempt(t *testing.T) {
	ctx := context.Background()
	attempts := 0

	initial := newReconnectSSEStream[TestMessage](ctx, "")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		attempts++
		if attempts < 3 {
			return nil, io.ErrUnexpectedEOF
		}
		return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"recovered\",\"done\":true}\n\n"), nil
	}, 5)
	defer func() { _ = initial.Close() }()

	msg, err := initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "recovered", msg.Content)
	assert.Equal(t, 3, attempts)
}

func TestStream_LastEventIDOverwrittenByLaterEvent(t *testing.T) {
	ctx := context.Background()
	var receivedLastEventID string

	initial := newReconnectSSEStream[TestMessage](ctx,
		"id: first\ndata: {\"content\":\"a\",\"done\":false}\n\n"+
			"id: second\ndata: {\"content\":\"b\",\"done\":false}\n\n",
	)
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		receivedLastEventID = lastEventID
		return newReconnectSSEStream[TestMessage](ctx, "data: {\"content\":\"c\",\"done\":true}\n\n"), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	_, err := initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "first", initial.LastEventID())

	_, err = initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "second", initial.LastEventID())

	// Reconnect should receive "second", not "first".
	_, err = initial.Recv()
	require.NoError(t, err)
	assert.Equal(t, "second", receivedLastEventID)
}

func TestStream_RecvEventMetadataAfterReconnect(t *testing.T) {
	ctx := context.Background()

	initial := newReconnectSSEStream[TestMessage](ctx, "id: e1\nevent: ping\ndata: {\"content\":\"before\",\"done\":false}\n\n")
	initial.ConfigureReconnect(func(lastEventID string) (*Stream[TestMessage], error) {
		return newReconnectSSEStream[TestMessage](ctx, "id: e2\nevent: pong\nretry: 5000\ndata: {\"content\":\"after\",\"done\":true}\n\n"), nil
	}, 10)
	defer func() { _ = initial.Close() }()

	event1, err := initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "ping", event1.Event)
	assert.Equal(t, "e1", event1.ID)

	event2, err := initial.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "pong", event2.Event)
	assert.Equal(t, "e2", event2.ID)
	assert.Equal(t, 5000, event2.Retry)
}

func TestStream_BareFieldNamesWithoutColon(t *testing.T) {
	// Per the SSE spec, a line with no colon is treated as a field name
	// with an empty string value.
	ctx := context.Background()

	// Bare "id" sets last event ID to empty string.
	// Bare "event" sets event type to empty string.
	// "data: ..." provides the payload.
	body := "id: original\ndata: {\"content\":\"a\",\"done\":false}\n\nid\nevent\ndata: {\"content\":\"b\",\"done\":true}\n\n"
	resp := &http.Response{
		StatusCode: 200,
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     http.Header{"Content-Type": []string{"text/event-stream"}},
	}
	stream := NewStream[TestMessage](ctx, resp,
		WithFormat(StreamFormatSSE),
		WithPrefix(""),
	)
	defer func() { _ = stream.Close() }()

	event1, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "a", event1.Data.Content)
	assert.Equal(t, "original", stream.LastEventID())

	// Bare "id" resets last event ID to empty string per spec.
	event2, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "b", event2.Data.Content)
	assert.Equal(t, "", event2.Event, "bare 'event' sets type to empty string")
	assert.Equal(t, "", stream.LastEventID(), "bare 'id' resets last event ID to empty")
}
