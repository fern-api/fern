package core

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// reconnectTestMessage is a simple message type for reconnection tests.
type reconnectTestMessage struct {
	Content string `json:"content"`
	Done    bool   `json:"done"`
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

func TestReconnectingStream_TransparentReconnection(t *testing.T) {
	ctx := context.Background()
	callCount := 0

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		callCount++
		if callCount == 1 {
			return newReconnectSSEStream[reconnectTestMessage](ctx, "data: {\"content\":\"world\",\"done\":true}\n\n"), nil
		}
		return newReconnectSSEStream[reconnectTestMessage](ctx, ""), nil
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "data: {\"content\":\"hello\",\"done\":false}\n\n")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)
	defer stream.Close()

	msg1, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "hello", msg1.Content)

	msg2, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "world", msg2.Content)

	assert.Equal(t, 1, callCount, "should have reconnected once")
}

func TestReconnectingStream_LastEventIDSentOnReconnect(t *testing.T) {
	ctx := context.Background()
	var receivedLastEventID string

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		receivedLastEventID = lastEventID
		return newReconnectSSEStream[reconnectTestMessage](ctx, "data: {\"content\":\"after\",\"done\":true}\n\n"), nil
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "id: evt-42\ndata: {\"content\":\"before\",\"done\":false}\n\n")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)
	defer stream.Close()

	event1, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "before", event1.Data.Content)
	assert.Equal(t, "evt-42", stream.LastEventID())

	_, err = stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "evt-42", receivedLastEventID)
}

func TestReconnectingStream_MaxAttemptsExhausted(t *testing.T) {
	ctx := context.Background()
	attempts := 0

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		attempts++
		return nil, io.ErrUnexpectedEOF
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn,
		WithMaxReconnectAttempts(3),
	)
	defer stream.Close()

	_, err := stream.Recv()
	require.Error(t, err)

	var reconnectErr *ReconnectError
	require.ErrorAs(t, err, &reconnectErr)
	assert.Equal(t, 3, reconnectErr.Attempts)
	assert.Equal(t, 3, attempts)
}

func TestReconnectingStream_DisabledWithZeroAttempts(t *testing.T) {
	ctx := context.Background()

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		t.Fatal("reconnect should not be called")
		return nil, nil
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn,
		WithMaxReconnectAttempts(0),
	)
	defer stream.Close()

	_, err := stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestReconnectingStream_ContextCancellation(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		cancel()
		return nil, io.ErrUnexpectedEOF
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)
	defer stream.Close()

	_, err := stream.Recv()
	assert.ErrorIs(t, err, context.Canceled)
}

func TestReconnectingStream_CloseStopsReconnection(t *testing.T) {
	ctx := context.Background()

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		return nil, io.ErrUnexpectedEOF
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)

	go func() {
		time.Sleep(50 * time.Millisecond)
		_ = stream.Close()
	}()

	_, err := stream.Recv()
	assert.Error(t, err)
}

func TestReconnectingStream_TerminatorStopsReconnection(t *testing.T) {
	ctx := context.Background()

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		t.Fatal("reconnect should not be called after terminator")
		return nil, nil
	}

	resp := &http.Response{
		StatusCode: 200,
		Body:       io.NopCloser(strings.NewReader("data: {\"content\":\"hi\",\"done\":false}\n\ndata: [DONE]\n\n")),
		Header:     http.Header{"Content-Type": []string{"text/event-stream"}},
	}
	initial := NewStream[reconnectTestMessage](ctx, resp,
		WithFormat(StreamFormatSSE),
		WithPrefix("data: "),
		WithTerminator("[DONE]"),
	)
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)
	defer stream.Close()

	msg, err := stream.Recv()
	require.NoError(t, err)
	assert.Equal(t, "hi", msg.Content)

	_, err = stream.Recv()
	assert.ErrorIs(t, err, io.EOF)
}

func TestReconnectingStream_JSONUnmarshalErrorNotRetryable(t *testing.T) {
	ctx := context.Background()

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		t.Fatal("reconnect should not be called for JSON errors")
		return nil, nil
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "data: not-valid-json\n\n")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn)
	defer stream.Close()

	_, err := stream.Recv()
	require.Error(t, err)
	var reconnectErr *ReconnectError
	assert.False(t, errors.As(err, &reconnectErr))
}

func TestReconnectingStream_ServerRetryPersistsAcrossReconnections(t *testing.T) {
	ctx := context.Background()
	callCount := 0

	reconnectFn := func(lastEventID string) (*Stream[reconnectTestMessage], error) {
		callCount++
		return newReconnectSSEStream[reconnectTestMessage](ctx, "data: {\"content\":\"resumed\",\"done\":true}\n\n"), nil
	}

	initial := newReconnectSSEStream[reconnectTestMessage](ctx, "retry: 2000\ndata: {\"content\":\"first\",\"done\":false}\n\n")
	stream := NewReconnectingStream[reconnectTestMessage](ctx, initial, reconnectFn,
		WithMaxReconnectAttempts(3),
	)
	defer stream.Close()

	event, err := stream.RecvEvent()
	require.NoError(t, err)
	assert.Equal(t, "first", event.Data.Content)
	assert.Equal(t, 2000, event.Retry)

	stream.mu.Lock()
	assert.Equal(t, 2*time.Second, stream.serverRetry)
	stream.mu.Unlock()
}
