package client

import (
	"context"
	"net/url"
	"strings"
)

// FooRequest is a request for calling the Foo endpoint.
type FooRequest struct {
	Id string `json:"id"`
}

// FooResponse is a response from the Foo endpoint.
type FooResponse struct {
	Success bool `json:"success"`
}

// ExampleClient is an example for a generated client interface
// that interacts with the rest of the generated code.
//
// Note that this API does _not_ support response headers (like
// the rest of Fern's generators). The caller simply gets the
// *FooResponse as-is, and that's it.
type ExampleClient interface {
	Foo(context.Context, *FooRequest, ...CallOption) (*FooResponse, error)
}

// NewExampleClient returns a new ExampleClient suitable
// for calling the example API.
func NewExampleClient(baseURL string, client Doer, opts ...ClientOption) (ExampleClient, error) {
	options := new(clientOptions)
	for _, opt := range opts {
		opt(options)
	}
	url, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}

	// The following line is only generated if the Fern
	// definition has a basePath set.
	baseURL = strings.TrimRight(url.String(), "/") + "/example"

	// The following line is controlled by the endpoint.path setting.
	fooURL := baseURL + "/foo"

	// We initialize the implementation upfront so we can reduce
	// the number of allocations on the hot path.
	//
	// However, some extra allocations will still be necessary depending
	// on the type of endpoint. For example, if the endpoint has path
	// parameters, then the request argument(s) will need to be applied to
	// the fooURL, as needed.
	fooImpl := func(ctx context.Context, request *FooRequest, opts ...CallOption) (*FooResponse, error) {
		response := new(FooResponse)
		if err := doRequest(ctx, client, fooURL, "GET", request, response, opts...); err != nil {
			return nil, err
		}
		return response, nil
	}

	return &exampleClient{
		foo: fooImpl,
	}, nil
}

// exampleClient implements the ExampleClient interface.
type exampleClient struct {
	foo func(context.Context, *FooRequest, ...CallOption) (*FooResponse, error)
}

// Foo calls the foo endpoint with the given request.
func (e *exampleClient) Foo(ctx context.Context, request *FooRequest, opts ...CallOption) (*FooResponse, error) {
	return e.foo(ctx, request, opts)
}
