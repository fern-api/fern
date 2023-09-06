package ast

import (
	"bytes"
	"fmt"
	"go/format"

	"github.com/fern-api/fern-go/internal/gospec"
)

// Writer writes content to a buffer held in memory.
// This abstraction is used by each individual expression
// to write itself.
type Writer struct {
	buffer *bytes.Buffer
	scope  *gospec.Scope
}

// Write writes the values without a newline.
func (w *Writer) Write(elements ...any) {
	for _, element := range elements {
		fmt.Fprint(w.buffer, element)
	}
}

// WriteLine writes the values and concludes with a newline.
func (w *Writer) WriteLine(elements ...any) {
	for _, element := range elements {
		fmt.Fprint(w.buffer, element)
	}
	fmt.Fprintln(w.buffer)
}

// WriteExpr writes the given expression.
func (w *Writer) WriteExpr(expr Expr) {
	if expr == nil {
		// Should never happen, but included for debugging purposes.
		w.Write("<nil>")
		return
	}
	expr.WriteTo(w)
}

// SourceCodeBuilder is used to generate usage examples, e.g.
//
//	import (
//	  acme "github.com/acme/acme-go"
//	  acmeclient "github.com/acme/acme-go/client"
//	)
//
//	client := acmeclient.NewClient(...)
type SourceCodeBuilder struct {
	expressions []Expr
}

func NewSourceCodeBuilder(expr ...Expr) *SourceCodeBuilder {
	builder := new(SourceCodeBuilder)
	return builder.AddExpr(expr...)
}

func (s *SourceCodeBuilder) AddExpr(expr ...Expr) *SourceCodeBuilder {
	s.expressions = append(s.expressions, expr...)
	return s
}

// BuildSnippet builds a source code snippet.
func (s *SourceCodeBuilder) BuildSnippet() (string, error) {
	writer := &Writer{
		buffer: bytes.NewBuffer(nil),
		scope:  gospec.NewScope(),
	}
	for i, expr := range s.expressions {
		if i > 0 {
			writer.WriteLine()
		}
		writer.WriteExpr(expr)
	}
	var prefix []byte
	if len(writer.scope.Imports.Values) > 0 {
		prefix = []byte(writer.scope.Imports.String() + "\n")
	}
	bytes, err := format.Source(writer.buffer.Bytes())
	if err != nil {
		return "", fmt.Errorf("failed to format snippet: %v\n%s", err, writer.buffer.String())
	}
	return string(append(prefix, bytes...)), nil
}
