package wiretest

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestCase represents a single test case used to verify the wire
// compatibility of the SDK.
type TestCase struct {
	Description string
	Request     *Request
	Response    *Response
}

// Request defines all of the request parameters that are expected by the server.
type Request struct {
	// The HTTP path that is expected by the server.
	Path string
	// The HTTP method that is expected by the server.
	Method string
	// The serialized query parameter string that is expected by the server (if any).
	Query string
	// The map of headers that are expected by the server (if any).
	Headers map[string]string
	// The raw request body that is expected by the server (if any).
	Body string
}

// Response defines all of the response parameters that are returned by the server.
type Response struct {
	// The map of headers that are returned by the server (if any).
	Headers map[string]string
	// The raw response body that is returned by the server (if any).
	Body string
}

// NewServer creates a new in-memory httptest server scoped to the given test case.
//
// The test handler asserts that all of the request parameters match the expected
// values, and responds with the configured response.
func NewServer(t *testing.T, testCase TestCase) (*httptest.Server, func()) {
	var called bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, r.URL.Path, testCase.Request.Path)
		require.Equal(t, r.Method, testCase.Request.Method)
		if testCase.Request.Query != "" {
			assert.Equal(t, r.URL.RawQuery, testCase.Request.Query)
		}
		for k, v := range testCase.Request.Headers {
			assert.Equal(t, r.Header.Get(k), v)
		}
		if testCase.Request.Body != "" {
			assert.Equal(t, r.Body, testCase.Request.Body)
		}
		for k, v := range testCase.Response.Headers {
			w.Header().Set(k, v)
		}
		if testCase.Response.Body != "" {
			w.Write([]byte(testCase.Response.Body))
		}
		called = true
	}))
	return server, func() {
		require.True(t, called, "the test server handler was not called for %q", testCase.Description)
		server.Close()
	}
}
