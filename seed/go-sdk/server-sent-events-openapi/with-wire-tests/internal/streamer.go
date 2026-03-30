package internal

import (
	"context"
	"net/http"
	"net/url"

	"github.com/server-sent-events-openapi/fern/core"
)

const (
	// DefaultSSEDataPrefix is the default prefix used for SSE streaming.
	DefaultSSEDataPrefix = "data: "

	// DefaultSSETerminator is the default terminator used for SSE streaming.
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
	URL                  string
	Method               string
	Prefix               string
	Delimiter            string
	Terminator           string
	MaxAttempts          uint
	Headers              http.Header
	BodyProperties       map[string]interface{}
	QueryParameters      url.Values
	Client               HTTPClient
	Request              interface{}
	ErrorDecoder         ErrorDecoder
	Format               core.StreamFormat
	EventDiscriminator   string
	MaxBufSize           int
	MaxReconnectAttempts *int
}

// Stream issues an API streaming call according to the given stream parameters.
func (s *Streamer[T]) Stream(ctx context.Context, params *StreamParams) (*core.Stream[T], error) {
	url := buildURL(params.URL, params.QueryParameters)

	client := s.client
	if params.Client != nil {
		client = params.Client
	}

	var retryOptions []RetryOption
	if params.MaxAttempts > 0 {
		retryOptions = append(retryOptions, WithMaxAttempts(params.MaxAttempts))
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
	if params.Format != core.StreamFormatEmpty {
		opts = append(opts, core.WithFormat(params.Format))
	}
	if params.EventDiscriminator != "" {
		opts = append(opts, core.WithEventDiscriminator(params.EventDiscriminator))
	}
	if params.MaxBufSize > 0 {
		opts = append(opts, core.WithMaxBufSize(params.MaxBufSize))
	}

	stream, err := s.doStreamRequest(ctx, url, params.Headers, params, client, retryOptions, opts)
	if err != nil {
		return nil, err
	}

	// Configure auto-reconnection for SSE streams.
	if params.Format == core.StreamFormatSSE {
		maxAttempts := 10
		if params.MaxReconnectAttempts != nil {
			maxAttempts = *params.MaxReconnectAttempts
		}
		reconnectFn := func(lastEventID string) (*core.Stream[T], error) {
			headers := params.Headers
			if lastEventID != "" {
				headers = params.Headers.Clone()
				headers.Set("Last-Event-ID", lastEventID)
			}
			return s.doStreamRequest(ctx, url, headers, params, client, retryOptions, opts)
		}
		stream.ConfigureReconnect(reconnectFn, maxAttempts)
	}

	return stream, nil
}

func (s *Streamer[T]) doStreamRequest(
	ctx context.Context,
	url string,
	headers http.Header,
	params *StreamParams,
	client HTTPClient,
	retryOptions []RetryOption,
	opts []core.StreamOption,
) (*core.Stream[T], error) {
	req, err := newRequest(
		ctx,
		url,
		params.Method,
		headers,
		params.Request,
		params.BodyProperties,
	)
	if err != nil {
		return nil, err
	}

	if err := ctx.Err(); err != nil {
		return nil, err
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

	if err := ctx.Err(); err != nil {
		defer func() { _ = resp.Body.Close() }()
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer func() { _ = resp.Body.Close() }()
		return nil, decodeError(resp, params.ErrorDecoder)
	}

	return core.NewStream[T](ctx, resp, opts...), nil
}
