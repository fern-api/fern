package client

import (
	"context"
	"encoding/json"
	"errors"
	"io"
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
	Foo(context.Context, *FooRequest, ...FooOption) (*FooResponse, error)
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

	// TODO: Everything prefixed with the name of the endpoint could
	// be placed in its own un-exported helper function and called like:
	//
	//  foo := newFooEndpoint(baseURL, client, opts...)

	// The following line is controlled by the endpoint.path setting.
	fooURL := baseURL + "/foo"

	// The following expression is generated if the endpoint specifies
	// any custom errors.
	fooErrorDeserializer := func(statusCode int, body io.Reader) error {
		// TODO: If the error disctrimination strategy is set,
		// this implementation will be adapted a bit. Like
		// unions, we'll first need to unmarshal the body into
		// a type that recognizes the discriminant, then unmarshal
		// the rest of the type after that.
		//
		// For example, if the discriminant is set to a 'name' field,
		// the following will be generated (instead of a simple switch
		// on the StatusCode):
		//
		//  bytes, err := io.ReadAll(body)
		//  if err != nil {
		//    return err
		//  }
		//  var discriminant struct {
		//    Name string `json:"name"`
		//  }
		//  if err := json.Unmarshal(bytes, &discriminant); err != nil {
		//    return err
		//  }
		//  switch discriminant.Name {
		//    ...
		//  }
		//
		decoder := json.NewDecoder(body)
		switch statusCode {
		case 404:
			value := new(UserNotFoundError)
			if err := decoder.Decode(value); err != nil {
				// TODO: The server responded with an error in a different shape
				// than what was expected.
				//
				// Should we preserve that error, or surface the failure
				// to decode error?
				return err
			}
			value.StatusCode = statusCode
			return value
		}
		// The error didn't match any of the known status codes,
		// so we just read the body as-is, and put it into the
		// normal error.
		bytes, err := io.ReadAll(body)
		if err != nil {
			return err
		}
		return errors.New(string(bytes))
	}

	// We initialize the implementation upfront so we can reduce
	// the number of allocations on the hot path.
	//
	// However, some extra allocations will still be necessary depending
	// on the type of endpoint. For example, if the endpoint has path
	// parameters, then the request argument(s) will need to be applied to
	// the fooURL, as needed.
	fooImpl := func(ctx context.Context, request *FooRequest, opts ...FooOption) (*FooResponse, error) {
		// TODO: Apply the foo options to the call.
		// We need to classify different types of foo options, such
		// as query builders, headers, etc. That way it's easy to
		// recognize what we need to do (at runtime) for the given option.
		response := new(FooResponse)
		if err := doRequest(ctx, client, fooURL, "GET", request, response, fooErrorDeserializer); err != nil {
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
	foo func(context.Context, *FooRequest, ...FooOption) (*FooResponse, error)
}

// Foo calls the foo endpoint with the given request.
func (e *exampleClient) Foo(ctx context.Context, request *FooRequest, opts ...FooOption) (*FooResponse, error) {
	return e.foo(ctx, request, opts...)
}
