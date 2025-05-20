package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/textproto"
	"strings"
)

// Named is implemented by types that define a name.
type Named interface {
	Name() string
}

// ContentTyped is implemented by types that define a Content-Type.
type ContentTyped interface {
	ContentType() string
}

// WriteMultipartOption adapts the behavior of the multipart writer.
type WriteMultipartOption func(*writeMultipartOptions)

// WithDefaultContentType sets the default Content-Type for the part
// written to the MultipartWriter.
//
// Note that if the part is a FileParam, the file's Content-Type takes
// precedence over the value provided here.
func WithDefaultContentType(contentType string) WriteMultipartOption {
	return func(options *writeMultipartOptions) {
		options.defaultContentType = contentType
	}
}

// MultipartWriter writes multipart/form-data requests.
type MultipartWriter struct {
	buffer *bytes.Buffer
	writer *multipart.Writer
}

// NewMultipartWriter creates a new multipart writer.
func NewMultipartWriter() *MultipartWriter {
	buffer := bytes.NewBuffer(nil)
	return &MultipartWriter{
		buffer: buffer,
		writer: multipart.NewWriter(buffer),
	}
}

// Buffer returns the underlying buffer.
func (w *MultipartWriter) Buffer() *bytes.Buffer {
	return w.buffer
}

// ContentType returns the Content-Type for an HTTP multipart/form-data.
func (w *MultipartWriter) ContentType() string {
	return w.writer.FormDataContentType()
}

// WriteFile writes the given file part.
func (w *MultipartWriter) WriteFile(
	field string,
	file io.Reader,
	opts ...WriteMultipartOption,
) error {
	options := newWriteMultipartOptions(opts...)
	return w.writeFile(field, file, options.defaultContentType)
}

// WriteField writes the given value as a form field.
func (w *MultipartWriter) WriteField(
	field string,
	value string,
	opts ...WriteMultipartOption,
) error {
	options := newWriteMultipartOptions(opts...)
	return w.writeField(field, value, options.defaultContentType)
}

// WriteJSON writes the given value as a JSON form field.
func (w *MultipartWriter) WriteJSON(
	field string,
	value interface{},
	opts ...WriteMultipartOption,
) error {
	bytes, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return w.WriteField(field, string(bytes), opts...)
}

// Close closes the writer.
func (w *MultipartWriter) Close() error {
	return w.writer.Close()
}

func (w *MultipartWriter) writeField(
	field string,
	value string,
	contentType string,
) error {
	part, err := w.newFormField(field, contentType)
	if err != nil {
		return err
	}
	_, err = part.Write([]byte(value))
	return err
}

func (w *MultipartWriter) writeFile(
	field string,
	file io.Reader,
	defaultContentType string,
) error {
	var (
		filename    = getFilename(file)
		contentType = getContentType(file)
	)
	if contentType == "" {
		contentType = defaultContentType
	}
	part, err := w.newFormPart(field, filename, contentType)
	if err != nil {
		return err
	}
	_, err = io.Copy(part, file)
	return err
}

// newFormField creates a new form field.
func (w *MultipartWriter) newFormField(
	field string,
	contentType string,
) (io.Writer, error) {
	return w.newFormPart(field, "" /* filename */, contentType)
}

// newFormPart creates a new form data part.
func (w *MultipartWriter) newFormPart(
	field string,
	filename string,
	contentType string,
) (io.Writer, error) {
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", getContentDispositionHeaderValue(field, filename))
	if contentType != "" {
		h.Set("Content-Type", contentType)
	}
	return w.writer.CreatePart(h)
}

// writeMultipartOptions are options used to adapt the behavior of the multipart writer.
type writeMultipartOptions struct {
	defaultContentType string
}

// newWriteMultipartOptions returns a new write multipart options.
func newWriteMultipartOptions(opts ...WriteMultipartOption) *writeMultipartOptions {
	options := new(writeMultipartOptions)
	for _, opt := range opts {
		opt(options)
	}
	return options
}

// getContentType returns the Content-Type for the given file, if any.
func getContentType(file io.Reader) string {
	if v, ok := file.(ContentTyped); ok {
		return v.ContentType()
	}
	return ""
}

// getFilename returns the name for the given file, if any.
func getFilename(file io.Reader) string {
	if v, ok := file.(Named); ok {
		return v.Name()
	}
	return ""
}

// getContentDispositionHeaderValue returns the value for the Content-Disposition header.
func getContentDispositionHeaderValue(field string, filename string) string {
	contentDisposition := fmt.Sprintf("form-data; name=%q", field)
	if filename != "" {
		contentDisposition += fmt.Sprintf(`; filename=%q`, escapeQuotes(filename))
	}
	return contentDisposition
}

// https://cs.opensource.google/go/go/+/refs/tags/go1.23.2:src/mime/multipart/writer.go;l=132
var quoteEscaper = strings.NewReplacer("\\", "\\\\", `"`, "\\\"")

// escapeQuotes is directly referenced from the standard library.
//
// https://cs.opensource.google/go/go/+/refs/tags/go1.23.2:src/mime/multipart/writer.go;l=134
func escapeQuotes(s string) string {
	return quoteEscaper.Replace(s)
}
