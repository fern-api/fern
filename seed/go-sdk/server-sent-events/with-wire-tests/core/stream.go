package core

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strings"
)

type StreamFormat string

const (
	StreamFormatSSE   StreamFormat = "sse"
	StreamFormatEmpty StreamFormat = ""
)

const (
	sseEventSeparator = "\n\n"
	sseLineSeparator  = "\n"
)

const (
	defaultMaxBufSize = 64 * 1024 // 64KB
)

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

// RecvRaw reads a raw message from the stream without JSON unmarshaling,
// returning io.EOF when all the messages have been read.
// This is useful when the stream may contain data that requires custom
// parsing or error handling.
func (s Stream[T]) RecvRaw() ([]byte, error) {
	bytes, err := s.reader.ReadFromStream()
	if err != nil {
		return nil, err
	}
	return bytes, nil
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
		if options.maxBufSize == 0 {
			options.maxBufSize = defaultMaxBufSize
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
	// Strip the trailing newline
	return bytes.TrimSuffix(line, []byte("\n")), nil
}

// ScannerStreamReader reads data from a *bufio.Scanner, which allows for
// configurable delimiters.
type ScannerStreamReader struct {
	scanner *bufio.Scanner
	options *streamOptions
}

func newScannerStreamReader(
	reader io.Reader,
	options *streamOptions,
) *ScannerStreamReader {
	scanner := bufio.NewScanner(reader)
	stream := &ScannerStreamReader{
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

func (s *ScannerStreamReader) ReadFromStream() ([]byte, error) {
	if s.scanner.Scan() {
		return s.scanner.Bytes(), nil
	}
	if err := s.scanner.Err(); err != nil {
		return nil, err
	}
	return nil, io.EOF
}

func (s *ScannerStreamReader) parse(bytes []byte) (int, []byte, error) {
	var startIndex int
	if s.options != nil && s.options.prefix != "" {
		if i := strings.Index(string(bytes), s.options.prefix); i >= 0 {
			startIndex = i + len(s.options.prefix)
		}
	}
	data := bytes[startIndex:]
	lineDelimiter := s.options.getLineDelimiter()
	delimIndex := strings.Index(string(data), lineDelimiter)
	if delimIndex < 0 {
		return startIndex + len(data), data, nil
	}
	endIndex := delimIndex + len(lineDelimiter)
	parsedData := data[:endIndex]
	n := startIndex + endIndex
	return n, parsedData, nil
}

func (s *ScannerStreamReader) isTerminated(bytes []byte) bool {
	if s.options == nil || s.options.terminator == "" {
		return false
	}
	return strings.Contains(string(bytes), s.options.terminator)
}

type streamOptions struct {
	delimiter          string
	prefix             string
	terminator         string
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
	return sseLineSeparator
}

type SseStreamReader struct {
	scanner *bufio.Scanner
	options *streamOptions
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
	scanner.Buffer(make([]byte, slices.Min([]int{4096, options.maxBufSize})), options.maxBufSize)

	// Configure scanner to split on SSE event separator (\n\n)
	// This is fixed by the SSE specification and cannot be changed
	scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
		if atEOF && len(data) == 0 {
			return 0, nil, nil
		}
		// SSE messages are always separated by blank lines (\n\n)
		if i := strings.Index(string(data), sseEventSeparator); i >= 0 {
			return i + len(sseEventSeparator), data[0:i], nil
		}

		if atEOF || stream.isTerminated(data) {
			return len(data), data, nil
		}
		return 0, nil, nil
	})
	return stream
}

func (s *SseStreamReader) isTerminated(bytes []byte) bool {
	if s.options == nil || s.options.terminator == "" {
		return false
	}
	return strings.Contains(string(bytes), s.options.terminator)
}

func (s *SseStreamReader) ReadFromStream() ([]byte, error) {

	event, err := s.nextEvent()
	if err != nil {
		return nil, err
	}
	// Check if the event data is the terminator (e.g. "[DONE]")
	if s.isTerminated(event.data) {
		return nil, io.EOF
	}
	// For protocol-level discrimination, inject the SSE event field value
	// as the discriminator key into the JSON data payload.
	if s.options.eventDiscriminator != "" && len(event.event) > 0 {
		event.data = injectDiscriminator(event.data, s.options.eventDiscriminator, string(event.event))
	}
	return event.data, nil
}

func (s *SseStreamReader) nextEvent() (*SseEvent, error) {

	event := SseEvent{}
	if s.scanner.Scan() {
		rawEvent := s.scanner.Bytes()

		// Parse individual lines within the SSE message
		// Lines are always separated by \n within a message (SSE specification)
		lines := strings.Split(string(rawEvent), sseLineSeparator)
		for _, line := range lines {
			s.parseSseLine([]byte(line), &event)
		}

		if event.size() > s.options.maxBufSize {
			return nil, errors.New("SseStreamReader.ReadFromStream: buffer limit exceeded")
		}
		return &event, nil
	}
	return &event, io.EOF
}

func (s *SseStreamReader) parseSseLine(_bytes []byte, event *SseEvent) {
	// Try to parse with space first (standard format), then without space (lenient format)
	if value, ok := s.tryParseField(_bytes, sseDataPrefix, sseDataPrefixNoSpace); ok {
		if len(event.data) > 0 {
			// Join multiple data: lines using the configured delimiter
			// This allows customization of how multi-line data is concatenated:
			// - "\n" (default): preserves line breaks for multi-line JSON
			// - "": concatenates without separator
			// - Any other string: custom separator
			lineDelimiter := s.options.getLineDelimiter()
			event.data = append(event.data, lineDelimiter...)
		}
		event.data = append(event.data, value...)
	} else if value, ok := s.tryParseField(_bytes, sseIdPrefix, sseIdPrefixNoSpace); ok {
		event.id = append(event.id, value...)
	} else if value, ok := s.tryParseField(_bytes, sseEventPrefix, sseEventPrefixNoSpace); ok {
		event.event = append(event.event, value...)
	} else if value, ok := s.tryParseField(_bytes, sseRetryPrefix, sseRetryPrefixNoSpace); ok {
		event.retry = append(event.retry, value...)
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
	return len(event.id) + len(event.data) + len(event.event) + len(event.retry)
}

func (event *SseEvent) String() string {
	return fmt.Sprintf("SseEvent{id: %q, event: %q, data: %q, retry: %q}", event.id, event.event, event.data, event.retry)
}

// injectDiscriminator inserts a JSON key-value pair for the discriminator
// at the beginning of a JSON object. For example, given data `{"content":"Hello"}`,
// field "type", and value "completion", it produces `{"type":"completion","content":"Hello"}`.
//
// If the data already contains the discriminator key, it is returned unchanged
// to avoid duplicate keys.
func injectDiscriminator(data []byte, field string, value string) []byte {
	trimmed := bytes.TrimSpace(data)
	if len(trimmed) == 0 || trimmed[0] != '{' {
		return data
	}
	// Skip injection if the key already exists in the data.
	quotedField := fmt.Sprintf("%q", field)
	if bytes.Contains(data, []byte(quotedField+":")) || bytes.Contains(data, []byte(quotedField+" :")) {
		return data
	}
	// Build the injected key-value: "field":"value"
	injected := quotedField + ":" + fmt.Sprintf("%q", value)
	// Find the opening brace in the original data
	openIdx := bytes.IndexByte(data, '{')
	after := data[openIdx+1:]
	// Check if the object has existing content (non-empty after trimming)
	afterTrimmed := bytes.TrimSpace(after)
	var result []byte
	if len(afterTrimmed) == 0 || afterTrimmed[0] == '}' {
		// Empty object: {"field":"value"}
		result = make([]byte, 0, len(data)+len(injected))
		result = append(result, data[:openIdx+1]...)
		result = append(result, injected...)
		result = append(result, after...)
	} else {
		// Non-empty object: {"field":"value",<existing>}
		result = make([]byte, 0, len(data)+len(injected)+1)
		result = append(result, data[:openIdx+1]...)
		result = append(result, injected...)
		result = append(result, ',')
		result = append(result, after...)
	}
	return result
}

type SseEvent struct {
	id    []byte
	data  []byte
	event []byte
	retry []byte
}

var (
	sseIdPrefix    = []byte("id: ")
	sseDataPrefix  = []byte("data: ")
	sseEventPrefix = []byte("event: ")
	sseRetryPrefix = []byte("retry: ")

	// Lenient prefixes without space for APIs that don't strictly follow SSE specification
	sseIdPrefixNoSpace    = []byte("id:")
	sseDataPrefixNoSpace  = []byte("data:")
	sseEventPrefixNoSpace = []byte("event:")
	sseRetryPrefixNoSpace = []byte("retry:")
)
