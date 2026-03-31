package core

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
)

type StreamFormat string

const (
	StreamFormatSSE   StreamFormat = "sse"
	StreamFormatEmpty StreamFormat = ""
)

const (
	// defaultDelimiter is the fallback delimiter for ScannerStreamReader
	// when no custom delimiter is configured via WithDelimiter.
	defaultDelimiter = "\n"

	// sseDataJoin is the separator used when concatenating multi-line SSE
	// data: fields. Per the WHATWG spec, this is always U+000A regardless
	// of the stream's line endings.
	sseDataJoin = "\n"
)

const (
	defaultMaxBufSize  = 1024 * 1024 // 1MB
	defaultInitBufSize = 4096        // Initial buffer allocation; grows as needed up to maxBufSize.
)

// Stream represents a stream of messages sent from a server.
type Stream[T any] struct {
	reader   streamReader
	closer   *onceCloser
	stopFunc func() bool
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

// WithFormat overrides the isSSE flag for the Stream.
//
// By default, the Stream is not SSE.
func WithFormat(format StreamFormat) StreamOption {
	return func(opts *streamOptions) {
		opts.format = format
	}
}

// WithEventDiscriminator configures the SSE stream reader to inject the
// SSE event field value as a JSON discriminator into the data payload.
// This is used for protocol-level discrimination where the union discriminant
// comes from the SSE event: field rather than from within the JSON data.
func WithEventDiscriminator(field string) StreamOption {
	return func(opts *streamOptions) {
		opts.eventDiscriminator = field
	}
}

// WithMaxBufSize overrides the maximum buffer size for the Stream.
//
// This controls the maximum size of a single message (in bytes) that the
// stream can process. By default, this is set to 1MB. If your streaming
// responses contain messages larger than the default, increase this value.
func WithMaxBufSize(size int) StreamOption {
	return func(opts *streamOptions) {
		if size > 0 {
			opts.maxBufSize = size
		}
	}
}

// SseEventMeta holds SSE metadata fields shared by StreamEvent and StreamEventRaw.
type SseEventMeta struct {
	ID    string
	Event string
	// Retry is the reconnection time in milliseconds.
	// Zero if not set or if the value was not a valid integer.
	Retry int
}

// StreamEvent contains the parsed data and SSE metadata for a single event.
type StreamEvent[T any] struct {
	SseEventMeta
	Data T
}

// StreamEventRaw contains the raw bytes and SSE metadata for a single event.
type StreamEventRaw struct {
	SseEventMeta
	Data []byte
}

// NewStream constructs a new Stream from the given *http.Response.
func NewStream[T any](ctx context.Context, response *http.Response, opts ...StreamOption) *Stream[T] {
	options := new(streamOptions)
	for _, opt := range opts {
		opt(options)
	}
	closer := newOnceCloser(response.Body)
	stop := context.AfterFunc(ctx, func() {
		_ = closer.Close()
	})
	return &Stream[T]{
		reader:   newStreamReader(response.Body, options),
		closer:   closer,
		stopFunc: stop,
	}
}

// Recv reads a message from the stream, returning io.EOF when
// all the messages have been read.
func (s *Stream[T]) Recv() (T, error) {
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

// RecvRaw reads a raw message from the stream without JSON unmarshaling,
// returning io.EOF when all the messages have been read.
// This is useful when the stream may contain data that requires custom
// parsing or error handling.
func (s *Stream[T]) RecvRaw() ([]byte, error) {
	bytes, err := s.reader.ReadFromStream()
	if err != nil {
		return nil, err
	}
	return bytes, nil
}

// Close closes the Stream.
func (s *Stream[T]) Close() error {
	if s.stopFunc != nil {
		s.stopFunc()
	}
	return s.closer.Close()
}

// recvSseEvent reads the next SSE event with metadata, falling back to
// ReadFromStream for non-SSE readers.
func (s *Stream[T]) recvSseEvent() (*SseEvent, error) {
	if reader, ok := s.reader.(sseEventReader); ok {
		return reader.ReadEvent()
	}
	data, err := s.reader.ReadFromStream()
	if err != nil {
		return nil, err
	}
	return &SseEvent{Data: data}, nil
}

// RecvEvent reads the next event from the stream, including SSE metadata
// (id, event type, retry). Returns io.EOF when all events have been read.
//
// This is only meaningful for SSE streams. For non-SSE streams, the
// metadata fields will always be zero-valued.
func (s *Stream[T]) RecvEvent() (StreamEvent[T], error) {
	var result StreamEvent[T]
	event, err := s.recvSseEvent()
	if err != nil {
		return result, err
	}
	if err := json.Unmarshal(event.Data, &result.Data); err != nil {
		return result, err
	}
	result.SseEventMeta = event.SseEventMeta
	return result, nil
}

// RecvEventRaw reads the next event from the stream without JSON unmarshaling,
// including SSE metadata. Returns io.EOF when all events have been read.
func (s *Stream[T]) RecvEventRaw() (StreamEventRaw, error) {
	var result StreamEventRaw
	event, err := s.recvSseEvent()
	if err != nil {
		return result, err
	}
	result.Data = event.Data
	result.SseEventMeta = event.SseEventMeta
	return result, nil
}

// LastEventID returns the most recently received non-empty event ID.
// Per the SSE spec, the last event ID persists across events and should
// be sent as the Last-Event-ID header when reconnecting.
//
// This works regardless of whether Recv or RecvEvent is used to consume
// the stream — the ID is tracked at the reader level.
func (s *Stream[T]) LastEventID() string {
	if reader, ok := s.reader.(sseEventReader); ok {
		return reader.LastEventID()
	}
	return ""
}

// streamReader reads data from a stream.
type streamReader interface {
	ReadFromStream() ([]byte, error)
}

// sseEventReader extends streamReader with SSE event metadata.
type sseEventReader interface {
	streamReader
	ReadEvent() (*SseEvent, error)
	LastEventID() string
}

// newStreamReader returns a new streamReader based on the given
// delimiter.
//
// By default, the streamReader uses a simple a *bufio.Reader
// which splits on newlines, and otherwise use a *bufio.Scanner to
// split on custom delimiters.
func newStreamReader(reader io.Reader, options *streamOptions) streamReader {
	if !options.isEmpty() {
		if options.maxBufSize == 0 {
			options.maxBufSize = defaultMaxBufSize
		}
		if options.terminator != "" {
			options.terminatorBytes = []byte(options.terminator)
		}
		if options.format == StreamFormatSSE {
			return newSseStreamReader(reader, options)
		}
		return newScannerStreamReader(reader, options)
	}
	return newBufferStreamReader(reader)
}

// BufferStreamReader reads data from a *bufio.Reader, which splits
// on newlines.
type BufferStreamReader struct {
	reader *bufio.Reader
}

func newBufferStreamReader(reader io.Reader) *BufferStreamReader {
	return &BufferStreamReader{
		reader: bufio.NewReader(reader),
	}
}

func (b *BufferStreamReader) ReadFromStream() ([]byte, error) {
	line, err := b.reader.ReadBytes('\n')
	if err != nil {
		return nil, err
	}
	return bytes.TrimSuffix(line, []byte("\n")), nil
}

// ScannerStreamReader reads data from a *bufio.Scanner, which allows for
// configurable delimiters.
type ScannerStreamReader struct {
	scanner        *bufio.Scanner
	options        *streamOptions
	prefixBytes    []byte
	delimiterBytes []byte
}

func newScannerStreamReader(
	reader io.Reader,
	options *streamOptions,
) *ScannerStreamReader {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, min(defaultInitBufSize, options.maxBufSize)), options.maxBufSize)
	stream := &ScannerStreamReader{
		scanner:        scanner,
		options:        options,
		prefixBytes:    []byte(options.prefix),
		delimiterBytes: []byte(options.getLineDelimiter()),
	}
	scanner.Split(func(data []byte, atEOF bool) (int, []byte, error) {
		if atEOF && len(data) == 0 {
			return 0, nil, nil
		}
		n, token, err := stream.parse(data)
		if stream.options.isTerminated(token) {
			return 0, nil, io.EOF
		}
		return n, token, err
	})
	return stream
}

func (s *ScannerStreamReader) ReadFromStream() ([]byte, error) {
	if s.scanner.Scan() {
		return s.scanner.Bytes(), nil
	}
	if err := s.scanner.Err(); err != nil {
		return nil, err
	}
	return nil, io.EOF
}

func (s *ScannerStreamReader) parse(data []byte) (int, []byte, error) {
	var startIndex int
	if len(s.prefixBytes) > 0 {
		if i := bytes.Index(data, s.prefixBytes); i >= 0 {
			startIndex = i + len(s.prefixBytes)
		}
	}
	content := data[startIndex:]
	delimIndex := bytes.Index(content, s.delimiterBytes)
	if delimIndex < 0 {
		return startIndex + len(content), content, nil
	}
	endIndex := delimIndex + len(s.delimiterBytes)
	parsedData := content[:endIndex]
	n := startIndex + endIndex
	return n, parsedData, nil
}

type streamOptions struct {
	delimiter          string
	prefix             string
	terminator         string
	terminatorBytes    []byte
	format             StreamFormat
	maxBufSize         int
	eventDiscriminator string
}

func (s *streamOptions) isEmpty() bool {
	return s.delimiter == "" && s.prefix == "" && s.terminator == "" && s.format == StreamFormatEmpty
}

func (s *streamOptions) getLineDelimiter() string {
	if s.delimiter != "" {
		return s.delimiter
	}
	return defaultDelimiter
}

func (s *streamOptions) isTerminated(data []byte) bool {
	return len(s.terminatorBytes) > 0 && bytes.Contains(data, s.terminatorBytes)
}

type onceCloser struct {
	closer io.Closer
	once   sync.Once
	err    error
}

func newOnceCloser(closer io.Closer) *onceCloser {
	return &onceCloser{closer: closer}
}

func (o *onceCloser) Close() error {
	o.once.Do(func() { o.err = o.closer.Close() })
	return o.err
}

type SseStreamReader struct {
	scanner     *bufio.Scanner
	options     *streamOptions
	lastEventID string

	// Precomputed discriminator injection patterns (empty if no discriminator configured).
	discriminatorQuotedField []byte // e.g. `"type"`
	discriminatorKeyCheck    []byte // e.g. `"type":`
	discriminatorKeyCheckSp  []byte // e.g. `"type" :`
}

func newSseStreamReader(
	reader io.Reader,
	options *streamOptions,
) *SseStreamReader {
	scanner := bufio.NewScanner(reader)
	stream := &SseStreamReader{
		scanner: scanner,
		options: options,
	}
	if options.eventDiscriminator != "" {
		quoted := fmt.Sprintf("%q", options.eventDiscriminator)
		stream.discriminatorQuotedField = []byte(quoted)
		stream.discriminatorKeyCheck = []byte(quoted + ":")
		stream.discriminatorKeyCheckSp = []byte(quoted + " :")
	}
	scanner.Buffer(make([]byte, min(defaultInitBufSize, options.maxBufSize)), options.maxBufSize)
	scanner.Split(scanSSELines)
	return stream
}

// scanSSELines splits SSE stream data into individual lines, handling all
// spec-compliant line endings: LF (\n), CR (\r), and CRLF (\r\n).
func scanSSELines(data []byte, atEOF bool) (advance int, token []byte, err error) {
	if atEOF && len(data) == 0 {
		return 0, nil, nil
	}
	for i := 0; i < len(data); i++ {
		switch data[i] {
		case '\n':
			return i + 1, data[:i], nil
		case '\r':
			if i+1 < len(data) {
				if data[i+1] == '\n' {
					return i + 2, data[:i], nil // CRLF
				}
				return i + 1, data[:i], nil // CR only
			}
			if atEOF {
				return len(data), data[:i], nil
			}
			// Need more data to distinguish \r from \r\n
			return 0, nil, nil
		}
	}
	if atEOF {
		return len(data), data, nil
	}
	return 0, nil, nil
}

func (s *SseStreamReader) nextEvent() (*SseEvent, error) {
	event := SseEvent{}
	for s.scanner.Scan() {
		line := s.scanner.Bytes()
		if len(line) == 0 {
			// Empty line = event boundary per SSE spec
			if event.hasID {
				s.lastEventID = event.ID
			}
			if event.size() > s.options.maxBufSize {
				return nil, errors.New("SseStreamReader.ReadFromStream: buffer limit exceeded")
			}
			return &event, nil
		}
		s.parseSseLine(line, &event)
	}
	if err := s.scanner.Err(); err != nil {
		return nil, err
	}
	// EOF — return any accumulated event
	if event.hasID {
		s.lastEventID = event.ID
	}
	if len(event.Data) > 0 || event.hasID || event.Event != "" {
		return &event, nil
	}
	return nil, io.EOF
}

// ReadEvent reads the next SSE event with full metadata, skipping comment-only events.
func (s *SseStreamReader) ReadEvent() (*SseEvent, error) {
	for {
		event, err := s.nextEvent()
		if err != nil {
			return nil, err
		}
		if s.options.isTerminated(event.Data) {
			return nil, io.EOF
		}
		if len(event.Data) == 0 {
			continue
		}
		if len(s.discriminatorQuotedField) > 0 && event.Event != "" {
			event.Data = s.injectDiscriminator(event.Data, event.Event)
		}
		return event, nil
	}
}

func (s *SseStreamReader) ReadFromStream() ([]byte, error) {
	event, err := s.ReadEvent()
	if err != nil {
		return nil, err
	}
	return event.Data, nil
}

// LastEventID returns the most recently received event ID.
func (s *SseStreamReader) LastEventID() string {
	return s.lastEventID
}

func (s *SseStreamReader) parseSseLine(line []byte, event *SseEvent) {
	if bytes.HasPrefix(line, sseCommentPrefix) {
		return
	}
	if value, ok := s.tryParseField(line, sseDataPrefix, sseDataPrefixNoSpace); ok {
		if len(event.Data) > 0 {
			event.Data = append(event.Data, sseDataJoin...)
		}
		event.Data = append(event.Data, value...)
	} else if value, ok := s.tryParseField(line, sseIdPrefix, sseIdPrefixNoSpace); ok {
		if !bytes.Contains(value, []byte{0}) {
			event.hasID = true
			event.ID = string(value)
		}
	} else if value, ok := s.tryParseField(line, sseEventPrefix, sseEventPrefixNoSpace); ok {
		event.Event = string(value)
	} else if value, ok := s.tryParseField(line, sseRetryPrefix, sseRetryPrefixNoSpace); ok {
		if n, err := strconv.Atoi(string(bytes.TrimSpace(value))); err == nil && n >= 0 {
			event.Retry = n
		}
	}
}

// tryParseField attempts to parse an SSE field by trying multiple prefix patterns in order.
// This handles APIs that don't strictly follow the SSE specification by omitting the space after the colon.
// It tries each prefix in the order provided and returns the value after the first matching prefix.
func (s *SseStreamReader) tryParseField(line []byte, prefixes ...[]byte) ([]byte, bool) {
	for _, prefix := range prefixes {
		if bytes.HasPrefix(line, prefix) {
			return line[len(prefix):], true
		}
	}
	return nil, false
}

func (event *SseEvent) size() int {
	return len(event.ID) + len(event.Data) + len(event.Event)
}

func (event *SseEvent) String() string {
	return fmt.Sprintf("SseEvent{id: %q, event: %q, data: %q, retry: %d}", event.ID, event.Event, event.Data, event.Retry)
}

// injectDiscriminator inserts a JSON key-value pair for the discriminator
// at the beginning of a JSON object. For example, given data `{"content":"Hello"}`,
// field "type", and value "completion", it produces `{"type":"completion","content":"Hello"}`.
//
// If the data already contains the discriminator key, it is returned unchanged
// to avoid duplicate keys. Uses precomputed patterns from reader construction.
func (s *SseStreamReader) injectDiscriminator(data []byte, value string) []byte {
	// Find the opening brace, skipping leading whitespace.
	openIdx := bytes.IndexByte(data, '{')
	if openIdx < 0 {
		return data
	}
	// Skip injection if the key already exists in the data.
	if bytes.Contains(data, s.discriminatorKeyCheck) || bytes.Contains(data, s.discriminatorKeyCheckSp) {
		return data
	}
	// Build the injected key-value: "field":"value"
	injected := append(s.discriminatorQuotedField, ':')
	injected = strconv.AppendQuote(injected, value)
	after := data[openIdx+1:]
	afterTrimmed := bytes.TrimSpace(after)
	var result []byte
	if len(afterTrimmed) == 0 || afterTrimmed[0] == '}' {
		result = make([]byte, 0, len(data)+len(injected))
		result = append(result, data[:openIdx+1]...)
		result = append(result, injected...)
		result = append(result, after...)
	} else {
		result = make([]byte, 0, len(data)+len(injected)+1)
		result = append(result, data[:openIdx+1]...)
		result = append(result, injected...)
		result = append(result, ',')
		result = append(result, after...)
	}
	return result
}

type SseEvent struct {
	SseEventMeta
	Data  []byte
	hasID bool
}

var (
	sseCommentPrefix = []byte(":")
	sseIdPrefix      = []byte("id: ")
	sseDataPrefix    = []byte("data: ")
	sseEventPrefix   = []byte("event: ")
	sseRetryPrefix   = []byte("retry: ")

	// Lenient prefixes without space for APIs that don't strictly follow SSE specification
	sseIdPrefixNoSpace    = []byte("id:")
	sseDataPrefixNoSpace  = []byte("data:")
	sseEventPrefixNoSpace = []byte("event:")
	sseRetryPrefixNoSpace = []byte("retry:")
)
