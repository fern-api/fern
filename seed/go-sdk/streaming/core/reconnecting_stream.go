package core

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"sync"
	"time"
)

const (
	defaultMaxReconnectAttempts = 10
	minReconnectDelay           = 500 * time.Millisecond
	maxReconnectDelay           = 30 * time.Second
)

type ReconnectError struct {
	Attempts int
	Err      error
}

func (e *ReconnectError) Error() string {
	return fmt.Sprintf("failed to reconnect after %d attempts: %v", e.Attempts, e.Err)
}

func (e *ReconnectError) Unwrap() error {
	return e.Err
}

type ReconnectFunc[T any] func(lastEventID string) (*Stream[T], error)

type ReconnectingStream[T any] struct {
	inner       *Stream[T]
	reconnectFn ReconnectFunc[T]
	maxAttempts int
	attempts    int
	serverRetry time.Duration
	lastEventID string
	ctx         context.Context
	cancel      context.CancelFunc
	closed      bool
	mu          sync.Mutex
}

type ReconnectingStreamOption func(*reconnectingStreamOptions)

type reconnectingStreamOptions struct {
	maxAttempts int
}

func WithMaxReconnectAttempts(attempts int) ReconnectingStreamOption {
	return func(opts *reconnectingStreamOptions) {
		opts.maxAttempts = attempts
	}
}

func NewReconnectingStream[T any](
	ctx context.Context,
	initial *Stream[T],
	reconnectFn ReconnectFunc[T],
	opts ...ReconnectingStreamOption,
) *ReconnectingStream[T] {
	options := &reconnectingStreamOptions{
		maxAttempts: defaultMaxReconnectAttempts,
	}
	for _, opt := range opts {
		opt(options)
	}
	ctx, cancel := context.WithCancel(ctx)
	return &ReconnectingStream[T]{
		inner:       initial,
		reconnectFn: reconnectFn,
		maxAttempts: options.maxAttempts,
		ctx:         ctx,
		cancel:      cancel,
	}
}

func isIOError(err error) bool {
	if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
		return true
	}
	var netErr net.Error
	if errors.As(err, &netErr) {
		return true
	}
	var jsonErr *json.SyntaxError
	if errors.As(err, &jsonErr) {
		return false
	}
	var jsonTypeErr *json.UnmarshalTypeError
	if errors.As(err, &jsonTypeErr) {
		return false
	}
	return true
}

func (r *ReconnectingStream[T]) recv(readFn func(*Stream[T]) (T, []byte, error)) (T, []byte, error) {
	var zero T
	for {
		r.mu.Lock()
		if r.closed {
			r.mu.Unlock()
			return zero, nil, io.EOF
		}
		inner := r.inner
		r.mu.Unlock()

		val, raw, err := readFn(inner)
		if err == nil {
			r.mu.Lock()
			r.lastEventID = inner.LastEventID()
			if retry := inner.ServerRetry(); retry > 0 {
				r.serverRetry = retry
			}
			r.attempts = 0
			r.mu.Unlock()
			return val, raw, nil
		}

		if errors.Is(err, io.EOF) && inner.Terminated() {
			return zero, nil, io.EOF
		}

		if r.ctx.Err() != nil {
			return zero, nil, r.ctx.Err()
		}

		if !isIOError(err) {
			return zero, nil, err
		}

		if r.maxAttempts <= 0 {
			return zero, nil, err
		}

		if reconnectErr := r.reconnect(); reconnectErr != nil {
			return zero, nil, reconnectErr
		}
	}
}

func (r *ReconnectingStream[T]) reconnect() error {
	r.mu.Lock()
	inner := r.inner
	r.inner = nil
	lastEventID := r.lastEventID
	r.mu.Unlock()

	if inner != nil {
		_ = inner.Close()
	}

	var lastErr error
	for {
		r.mu.Lock()
		if r.attempts >= r.maxAttempts {
			attempts := r.attempts
			r.mu.Unlock()
			return &ReconnectError{
				Attempts: attempts,
				Err:      lastErr,
			}
		}
		attempt := r.attempts
		r.attempts++
		serverRetry := r.serverRetry
		r.mu.Unlock()

		delay := backoffDelay(attempt, serverRetry)

		timer := time.NewTimer(delay)
		select {
		case <-r.ctx.Done():
			timer.Stop()
			return r.ctx.Err()
		case <-timer.C:
		}

		newStream, err := r.reconnectFn(lastEventID)
		if err != nil {
			lastErr = err
			continue
		}

		r.mu.Lock()
		r.inner = newStream
		r.mu.Unlock()
		return nil
	}
}

func backoffDelay(attempt int, serverRetry time.Duration) time.Duration {
	base := minReconnectDelay
	if serverRetry > 0 {
		base = serverRetry
	}

	delay := base
	for i := 0; i < attempt && delay < maxReconnectDelay; i++ {
		delay *= 2
	}
	if delay > maxReconnectDelay {
		delay = maxReconnectDelay
	}

	// Apply ±10% symmetric jitter.
	jitterRange := int64(delay) / 5
	if jitterRange <= 0 {
		return delay
	}
	jitter := rand.Int63n(jitterRange)
	return delay - delay/10 + time.Duration(jitter)
}

func (r *ReconnectingStream[T]) Recv() (T, error) {
	val, _, err := r.recv(func(s *Stream[T]) (T, []byte, error) {
		val, err := s.Recv()
		return val, nil, err
	})
	return val, err
}

func (r *ReconnectingStream[T]) RecvRaw() ([]byte, error) {
	var zero T
	_, raw, err := r.recv(func(s *Stream[T]) (T, []byte, error) {
		raw, err := s.RecvRaw()
		return zero, raw, err
	})
	return raw, err
}

func (r *ReconnectingStream[T]) RecvEvent() (StreamEvent[T], error) {
	var result StreamEvent[T]
	val, _, err := r.recv(func(s *Stream[T]) (T, []byte, error) {
		event, err := s.RecvEvent()
		if err != nil {
			var zero T
			return zero, nil, err
		}
		result.SseEventMeta = event.SseEventMeta
		return event.Data, nil, nil
	})
	if err != nil {
		return result, err
	}
	result.Data = val
	return result, nil
}

func (r *ReconnectingStream[T]) RecvEventRaw() (StreamEventRaw, error) {
	var zero T
	var result StreamEventRaw
	_, raw, err := r.recv(func(s *Stream[T]) (T, []byte, error) {
		event, err := s.RecvEventRaw()
		if err != nil {
			return zero, nil, err
		}
		result.SseEventMeta = event.SseEventMeta
		return zero, event.Data, nil
	})
	if err != nil {
		return result, err
	}
	result.Data = raw
	return result, nil
}

func (r *ReconnectingStream[T]) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.closed = true
	r.cancel()
	if r.inner != nil {
		return r.inner.Close()
	}
	return nil
}

func (r *ReconnectingStream[T]) LastEventID() string {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.lastEventID
}
