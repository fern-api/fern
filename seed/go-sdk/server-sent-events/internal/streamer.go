package internal

import (
	"context"
	"net/http"
	"net/url"

	"github.com/server-sent-events/fern/core"
)

const (
	// DefaultDataPrefix is the default prefix used for SSE streaming.
	DefaultSSEDataPrefix = "data: "

	// DefaultTerminator is the default terminator used for SSE streaming.
	DefaultSSETerminator = "[DONE]"
)

// Streamer calls APIs and streams responses using a *Stream.
type Streamer[T any] struct {
	client  HTTPClient
	retrier *Retrier
}

// NewStreamer returns a new *Streamer backed by the given caller's HTTP client.
func NewStreamer[T any](caller *Caller) *Streamer[T] {
	return &Streamer[T]{
		client:  caller.client,
		retrier: caller.retrier,
	}
}

// StreamParams represents the parameters used to issue an API streaming call.
type StreamParams struct {
	URL             string
	Method          string
	Prefix          string
	Delimiter       string
	Terminator      string
	MaxAttempts     uint
	Headers         http.Header
	BodyProperties  map[string]interface{}
	QueryParameters url.Values
	Client          HTTPClient
	Request         interface{}
	ErrorDecoder    ErrorDecoder
}

// Stream issues an API streaming call according to the given stream parameters.
func (s *Streamer[T]) Stream(ctx context.Context, params *StreamParams) (*core.Stream[T], error) {
	url := buildURL(params.URL, params.QueryParameters)
	req, err := newRequest(
		ctx,
		url,
		params.Method,
		params.Headers,
		params.Request,
		params.BodyProperties,
	)
	if err != nil {
		return nil, err
	}

	// If the call has been cancelled, don't issue the request.
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	client := s.client
	if params.Client != nil {
		// Use the HTTP client scoped to the request.
		client = params.Client
	}

	var retryOptions []RetryOption
	if params.MaxAttempts > 0 {
		retryOptions = append(retryOptions, WithMaxAttempts(params.MaxAttempts))
	}

	resp, err := s.retrier.Run(
		client.Do,
		req,
		params.ErrorDecoder,
		retryOptions...,
	)
	if err != nil {
		return nil, err
	}

	// Check if the call was cancelled before we return the error
	// associated with the call and/or unmarshal the response data.
	if err := ctx.Err(); err != nil {
		defer resp.Body.Close()
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer resp.Body.Close()
		return nil, decodeError(resp, params.ErrorDecoder)
	}

	var opts []core.StreamOption
	if params.Delimiter != "" {
		opts = append(opts, core.WithDelimiter(params.Delimiter))
	}
	if params.Prefix != "" {
		opts = append(opts, core.WithPrefix(params.Prefix))
	}
	if params.Terminator != "" {
		opts = append(opts, core.WithTerminator(params.Terminator))
	}

	return core.NewStream[T](resp, opts...), nil
}
