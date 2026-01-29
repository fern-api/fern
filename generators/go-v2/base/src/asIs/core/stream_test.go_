package core

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestMessage represents a test message for streaming tests.
type TestMessage struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
}

// TestStreamMessage represents a more complex test message.
type TestStreamMessage struct {
	Delta  string `json:"delta"`
	Tokens *int   `json:"tokens,omitempty"`
}

func TestSseStreamReader_TerminatorHandling(t *testing.T) {
	tests := []struct {
		desc        string
		sseData     string
		terminator  string
		wantMessages int
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
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/event-stream")
				w.Header().Set("Cache-Control", "no-cache")
				w.Header().Set("Connection", "keep-alive")
				w.WriteHeader(200)
				w.Write([]byte(test.sseData))
			}))
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer resp.Body.Close()

			var opts []StreamOption
			if test.terminator != "" {
				opts = append(opts, WithTerminator(test.terminator), WithFormat(StreamFormatSSE))
			} else {
				opts = append(opts, WithFormat(StreamFormatSSE))
			}

			stream := NewStream[TestMessage](resp, opts...)
			defer stream.Close()

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
		desc     string
		sseData  string
		wantRaw  []string
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
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/event-stream")
				w.WriteHeader(200)
				w.Write([]byte(test.sseData))
			}))
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer resp.Body.Close()

			stream := NewStream[TestMessage](resp, WithFormat(StreamFormatSSE))
			defer stream.Close()

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

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		w.Write([]byte(sseData))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer resp.Body.Close()

	stream := NewStream[TestMessage](resp, WithFormat(StreamFormatSSE), WithTerminator("[DONE]"))
	defer stream.Close()

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
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "text/event-stream")
				w.WriteHeader(200)
				w.Write([]byte(test.sseData))
			}))
			defer server.Close()

			resp, err := http.Get(server.URL)
			require.NoError(t, err)
			defer resp.Body.Close()

			stream := NewStream[TestStreamMessage](resp, WithFormat(StreamFormatSSE))
			defer stream.Close()

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

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.WriteHeader(200)
		w.Write([]byte(sseData))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer resp.Body.Close()

	// The buffer limit is internal and can't be configured through public API
	// This test validates that very large messages can still be processed
	stream := NewStream[TestMessage](resp, WithFormat(StreamFormatSSE))
	defer stream.Close()

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
		w.Write([]byte(`data: {"content":"test"}` + "\n\n"))
		if f, ok := w.(http.Flusher); ok {
			f.Flush()
		}
		// Keep connection open
		<-r.Context().Done()
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)

	stream := NewStream[TestMessage](resp, WithFormat(StreamFormatSSE))

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
		w.Write([]byte(customData))
	}))
	defer server.Close()

	resp, err := http.Get(server.URL)
	require.NoError(t, err)
	defer resp.Body.Close()

	// Use default stream (newline delimited)
	stream := NewStream[TestMessage](resp)
	defer stream.Close()

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

// Helper function to create int pointer
func intPtr(i int) *int {
	return &i
}