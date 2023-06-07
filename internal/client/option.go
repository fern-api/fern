package client

import "net/http"

// TODO: If we want endpoint-specific call options (e.g.
// custom headers, query parameters, etc), then it doesn't
// make much sense to support both a context-based approach
// and an option-based approach (if we don't have to).
//
// The challenge here is that if we generate a separate option
// type for every endpoint (e.g. FooOption), then how do the
// general CallOptions (e.g. header-based call options) intermix?
//
// One strategy would be to implement _every_ relevant endpoint
// option from the CallOption so that they could be used interchangeably.

// CallOption adapts the behavior of a an individual endpoint. These
// options can be applied to _every_ endpoint, so they implement all of
// their interfaces.
type CallOption interface {
	FooOption
	BarOption
}

// WithHeader sets the given header, validating that the header
// names don't collide with Fern's standard set of headers (e.g.
// Accept, Content-Type, etc).
func WithHeader(header http.Header) (CallOption, error) {
	// TODO: Validate and make a copy of the headers.
	return &headerOption{
		header: header,
	}, nil
}

// FooOption adapts the behavior of the Foo endpoint.
type FooOption interface {
	applyFoo(*fooOptions)
}

// FooWithLimit adds the given limit as a query parameter to the Foo endpoint.
//
// Note that we need to prefix this option with the name of the endpoint just
// in case other endpoints define their own query parameter with a different type
// (e.g. a non-optional limit).
//
// This examples is referenced from https://buildwithfern.com/docs/definition/endpoints#query-parameters
func FooWithLimit(limit int) FooOption {
	return &fooLimitOption{
		limit: limit,
	}
}

// BarOption adapts the behavior of the Bar endpoint.
type BarOption interface {
	applyBar(*barOptions)
}

// BarWithEndpointHeader adds the given endpoint header value.
//
// Like query parameter options (e.g. FooWithLimit above), headers
// attached to individual endpoints receive their own call option
// scoped to the endpoint, so we use the Bar prefix in the name.
//
// This examples is referenced from https://buildwithfern.com/docs/definition/endpoints#headers
func BarWithEndpointHeader(endpointHeader string) BarOption {
	return &barEndpointHeaderOption{
		endpointHeader: endpointHeader,
	}
}

// AuthorizationOption would be yet another option that would only
// implement the endpoints where it's enabled.
//
// In this case, suppose that Bar requires auth, but Foo does not.
type AuthorizationOption interface {
	BarOption
}

// WithAuthorization adds the given bearer to the authorization header.
func WithAuthorization(bearer string) AuthorizationOption {
	return &authorizationOption{
		authorizationBearer: bearer,
	}
}

// callOptions holds all of the configuration options for
// an endpoint call. There are none for now.
type callOptions struct{}

type headerOption struct {
	header http.Header
}

func (h *headerOption) applyFoo(opts *fooOptions) {
	opts.header = h.header
}

func (h *headerOption) applyBar(opts *barOptions) {
	opts.header = h.header
}

// fooOptions holds all of the configuration options for
// a Foo endpoint call.
type fooOptions struct {
	header http.Header
	limit  int
}

type fooLimitOption struct {
	limit int
}

func (f *fooLimitOption) applyFoo(opts *fooOptions) {
	opts.limit = f.limit
}

// barOptions holds all of the configuration options for
// the bar endpoint call.
type barOptions struct {
	authorizationBearer string
	header              http.Header
	endpointHeader      string
}

type barEndpointHeaderOption struct {
	endpointHeader string
}

func (b *barEndpointHeaderOption) applyBar(opts *barOptions) {
	opts.endpointHeader = b.endpointHeader
}

type authorizationOption struct {
	authorizationBearer string
}

func (a *authorizationOption) applyBar(opts *barOptions) {
	opts.authorizationBearer = a.authorizationBearer
}
