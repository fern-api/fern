// Code generated by Fern. DO NOT EDIT.

package client

import (
	core "github.com/objects-with-imports/fern/core"
	internal "github.com/objects-with-imports/fern/internal"
	option "github.com/objects-with-imports/fern/option"
	http "net/http"
)

type Client struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		baseURL: options.BaseURL,
		caller: internal.NewCaller(
			&internal.CallerParams{
				Client:      options.HTTPClient,
				MaxAttempts: options.MaxAttempts,
			},
		),
		header: options.ToHeader(),
	}
}
