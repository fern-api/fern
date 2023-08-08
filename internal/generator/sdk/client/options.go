package client

import (
	"net/http"

	"github.com/fern-api/fern-go/internal/generator/sdk/core"
)

// ---
// This file is not used as a template for code generation. It is only included so that
// the client_test.go template can actually run as a real test file in this repository.
// ---

// ClientWithBaseURL sets the client's base URL, overriding the
// default environment, if any.
func ClientWithBaseURL(baseURL string) core.ClientOption {
	return func(opts *core.ClientOptions) {
		opts.BaseURL = baseURL
	}
}

// ClientWithHTTPClient uses the given HTTPClient to issue all HTTP requests.
func ClientWithHTTPClient(httpClient core.HTTPClient) core.ClientOption {
	return func(opts *core.ClientOptions) {
		opts.HTTPClient = httpClient
	}
}

// ClientWithHTTPHeader adds the given http.Header to all requests
// issued by the client.
func ClientWithHTTPHeader(httpHeader http.Header) core.ClientOption {
	return func(opts *core.ClientOptions) {
		// Clone the headers so they can't be modified after the option call.
		opts.HTTPHeader = httpHeader.Clone()
	}
}
