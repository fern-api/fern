package client

import option "github.com/examples/fern/option"

// NewAcmeClient is a wrapper around NewClient that allows you to create
// a new client with the Acme API.
func NewAcmeClient(opts ...option.RequestOption) *Client {
	return NewClient(opts...)
}
