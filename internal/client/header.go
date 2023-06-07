package client

import (
	"context"
	"fmt"
	"net/http"
)

// TODO: This is just a proposal for now, the other approach being
// explored is outlined in option.go.

// requestHeaderKey uniquely identifies the http.Header attached
// to the context.
var requestHeaderKey struct{}

// WithRequestHeaders sets the given header, replacing those that
// already exist on the context.Context, if any.
//
// Note that internal Fern headers (e.g. Accept, Content-Type, etc)
// cannot be overwritten.
func WithRequestHeaders(ctx context.Context, header http.Header) (context.Context, error) {
	for name := range header {
		if _, ok := fernHeaders[name]; ok {
			return nil, fmt.Errorf("cannot set standard header %q", name)
		}
	}
	// Make a copy so that the user can't mutate the headers after
	// we've attached them to the context.
	headerCopy := make(http.Header, len(header))
	for name, value := range header {
		if value == nil {
			headerCopy[name] = nil
			continue
		}
		headerCopy[name] = make([]string, len(value))
		copy(headerCopy[name], value)
	}
	return context.WithValue(ctx, requestHeaderKey, headerCopy), nil
}

// GetRequestHeaders reads the request headers from the given context.
func GetRequestHeaders(ctx context.Context) (http.Header, bool) {
	header, ok := ctx.Value(requestHeaderKey).(http.Header)
	return header, ok
}
