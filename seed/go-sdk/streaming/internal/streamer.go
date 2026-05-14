package internal

import (
	"context"
	"net/http"
	"net/url"

	"github.com/fern-api/stream-go/v2/core"
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
	URL                        string
	Method                     string
	Prefix                     string
	Delimiter                  string
	Terminator                 string
	MaxAttempts                uint
	DisableRetries             bool
	MaxStreamReconnectAttempts uint
	DisableStreamReconnection  bool
	Headers                    http.Header
	BodyProperties             map[string]interface{}
	QueryParameters            url.Values
	Client                     HTTPClient
	Request                    interface{}
	ErrorDecoder               ErrorDecoder
	Format                     core.StreamFormat
	EventDiscriminator         string
	MaxBufSize                 int
}

// Stream issues an API streaming call according to the given stream parameters.
func (s *Streamer[T]) Stream(ctx context.Context, params *StreamParams) (*core.Stream[T], error) {
	return s.stream(ctx, params, false /* withReconnect */)
}

// StreamWithReconnect issues an API streaming call and returns a stream that
// transparently reconnects mid-flight using SSE Last-Event-ID semantics.
// Reconnection is bypassed when params.DisableStreamReconnection is true.
func (s *Streamer[T]) StreamWithReconnect(ctx context.Context, params *StreamParams) (*core.Stream[T], error) {
	return s.stream(ctx, params, true /* withReconnect */)
}

func (s *Streamer[T]) stream(ctx context.Context, params *StreamParams, withReconnect bool) (*core.Stream[T], error) {
	resp, opts, err := s.streamOnce(ctx, params, "")
	if err != nil {
		return nil, err
	}
	if withReconnect && !params.DisableStreamReconnection {
		opts = append(opts, core.WithReconnect(
			func(ctx context.Context, lastEventID string) (*http.Response, error) {
				next, _, err := s.streamOnce(ctx, params, lastEventID)
				return next, err
			},
			params.MaxStreamReconnectAttempts,
		))
	}
	return core.NewStream[T](ctx, resp, opts...), nil
}

// streamOnce builds and issues a single streaming HTTP request, returning the
// response and the stream options derived from params. When lastEventID is
// non-empty, it is set as the Last-Event-ID request header so the server can
// resume from that point.
func (s *Streamer[T]) streamOnce(
	ctx context.Context,
	params *StreamParams,
	lastEventID string,
) (*http.Response, []core.StreamOption, error) {
	url := buildURL(params.URL, params.QueryParameters)
	headers := params.Headers
	if lastEventID != "" {
		// Clone so reconnect attempts don't mutate the caller's header map.
		if headers != nil {
			headers = headers.Clone()
		} else {
			headers = http.Header{}
		}
		headers.Set("Last-Event-ID", lastEventID)
	}
	req, err := newRequest(
		ctx,
		url,
		params.Method,
		headers,
		params.Request,
		params.BodyProperties,
	)
	if err != nil {
		return nil, nil, err
	}

	// If the call has been cancelled, don't issue the request.
	if err := ctx.Err(); err != nil {
		return nil, nil, err
	}

	client := s.client
	if params.Client != nil {
		// Use the HTTP client scoped to the request.
		client = params.Client
	}

	resp, err := s.retrier.Run(
		client.Do,
		req,
		params.ErrorDecoder,
		buildRetryOptions(params.MaxAttempts, params.DisableRetries)...,
	)
	if err != nil {
		return nil, nil, err
	}

	// Check if the call was cancelled before we return the error
	// associated with the call and/or unmarshal the response data.
	if err := ctx.Err(); err != nil {
		defer func() { _ = resp.Body.Close() }()
		return nil, nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer func() { _ = resp.Body.Close() }()
		return nil, nil, decodeError(resp, params.ErrorDecoder)
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

	return resp, opts, nil
}
