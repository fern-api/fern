package core

import (
	"bufio"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const (
	// DefaultDataPrefix is the default prefix used for SSE streaming.
	DefaultSSEDataPrefix = "data: "

	// DefaultTerminator is the default terminator used for SSE streaming.
	DefaultSSETerminator = "[DONE]"

	// The default stream delimiter used to split messages.
	defaultStreamDelimiter = '\n'
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
func (s *Streamer[T]) Stream(ctx context.Context, params *StreamParams) (*Stream[T], error) {
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

	var opts []StreamOption
	if params.Delimiter != "" {
		opts = append(opts, WithDelimiter(params.Delimiter))
	}
	if params.Prefix != "" {
		opts = append(opts, WithPrefix(params.Prefix))
	}
	if params.Terminator != "" {
		opts = append(opts, WithTerminator(params.Terminator))
	}

	return NewStream[T](resp, opts...), nil
}

// Stream represents a stream of messages sent from a server.
type Stream[T any] struct {
	reader streamReader
	closer io.Closer
}

// StreamOption adapts the behavior of the Stream.
type StreamOption func(*streamOptions)

// WithDelimiter overrides the delimiter for the Stream.
//
// By default, the Stream is newline-delimited.
func WithDelimiter(delimiter string) StreamOption {
	return func(opts *streamOptions) {
		opts.delimiter = delimiter
	}
}

// WithPrefix overrides the prefix for the Stream.
//
// By default, the Stream doesn't have a prefix.
func WithPrefix(prefix string) StreamOption {
	return func(opts *streamOptions) {
		opts.prefix = prefix
	}
}

// WithTerminator overrides the terminator for the Stream.
//
// By default, the Stream terminates on EOF.
func WithTerminator(terminator string) StreamOption {
	return func(opts *streamOptions) {
		opts.terminator = terminator
	}
}

// NewStream constructs a new Stream from the given *http.Response.
func NewStream[T any](response *http.Response, opts ...StreamOption) *Stream[T] {
	options := new(streamOptions)
	for _, opt := range opts {
		opt(options)
	}
	return &Stream[T]{
		reader: newStreamReader(response.Body, options),
		closer: response.Body,
	}
}

// Recv reads a message from the stream, returning io.EOF when
// all the messages have been read.
func (s Stream[T]) Recv() (T, error) {
	var value T
	bytes, err := s.reader.ReadFromStream()
	if err != nil {
		return value, err
	}
	if err := json.Unmarshal(bytes, &value); err != nil {
		return value, err
	}
	return value, nil
}

// Close closes the Stream.
func (s Stream[T]) Close() error {
	return s.closer.Close()
}

// streamReader reads data from a stream.
type streamReader interface {
	ReadFromStream() ([]byte, error)
}

// newStreamReader returns a new streamReader based on the given
// delimiter.
//
// By default, the streamReader uses a simple a *bufio.Reader
// which splits on newlines, and otherwise use a *bufio.Scanner to
// split on custom delimiters.
func newStreamReader(reader io.Reader, options *streamOptions) streamReader {
	if !options.isEmpty() {
		if options.delimiter == "" {
			options.delimiter = string(defaultStreamDelimiter)
		}
		return newScannerStreamReader(reader, options)
	}
	return newBufferStreamReader(reader)
}

// bufferStreamReader reads data from a *bufio.Reader, which splits
// on newlines.
type bufferStreamReader struct {
	reader *bufio.Reader
}

func newBufferStreamReader(reader io.Reader) *bufferStreamReader {
	return &bufferStreamReader{
		reader: bufio.NewReader(reader),
	}
}

func (b *bufferStreamReader) ReadFromStream() ([]byte, error) {
	return b.reader.ReadBytes(defaultStreamDelimiter)
}

// scannerStreamReader reads data from a *bufio.Scanner, which allows for
// configurable delimiters.
type scannerStreamReader struct {
	scanner *bufio.Scanner
	options *streamOptions
}

func newScannerStreamReader(
	reader io.Reader,
	options *streamOptions,
) *scannerStreamReader {
	scanner := bufio.NewScanner(reader)
	stream := &scannerStreamReader{
		scanner: scanner,
		options: options,
	}
	scanner.Split(func(bytes []byte, atEOF bool) (int, []byte, error) {
		if atEOF && len(bytes) == 0 {
			return 0, nil, nil
		}
		n, data, err := stream.parse(bytes)
		if stream.isTerminated(data) {
			return 0, nil, io.EOF
		}
		return n, data, err
	})
	return stream
}

func (s *scannerStreamReader) ReadFromStream() ([]byte, error) {
	if s.scanner.Scan() {
		return s.scanner.Bytes(), nil
	}
	if err := s.scanner.Err(); err != nil {
		return nil, err
	}
	return nil, io.EOF
}

func (s *scannerStreamReader) parse(bytes []byte) (int, []byte, error) {
	var start int
	if s.options != nil && s.options.prefix != "" {
		if i := strings.Index(string(bytes), s.options.prefix); i >= 0 {
			start = i + len(s.options.prefix)
		}
	}
	data := bytes[start:]
	if i := strings.Index(string(data), s.options.delimiter); i >= 0 {
		data = data[:i+len(s.options.delimiter)]
	}
	n := start + len(data) + len(s.options.delimiter)
	return n, data, nil
}

func (s *scannerStreamReader) isTerminated(bytes []byte) bool {
	if s.options == nil || s.options.terminator == "" {
		return false
	}
	return strings.Contains(string(bytes), s.options.terminator)
}

type streamOptions struct {
	delimiter  string
	prefix     string
	terminator string
}

func (s *streamOptions) isEmpty() bool {
	return s.delimiter == "" && s.prefix == "" && s.terminator == ""
}
