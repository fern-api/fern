// Code generated by Fern. DO NOT EDIT.

package client

import (
	core "github.com/optional/fern/core"
	internal "github.com/optional/fern/internal"
	option "github.com/optional/fern/option"
	optional "github.com/optional/fern/optional"
	http "net/http"
)

type Client struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header

	Optional *optional.Client
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
		header:   options.ToHeader(),
		Optional: optional.NewClient(opts...),
	}
}
