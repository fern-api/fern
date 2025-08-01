// Code generated by Fern. DO NOT EDIT.

package client

import (
	client "github.com/oauth-client-credentials-nested-root/fern/auth/client"
	core "github.com/oauth-client-credentials-nested-root/fern/core"
	internal "github.com/oauth-client-credentials-nested-root/fern/internal"
	option "github.com/oauth-client-credentials-nested-root/fern/option"
	http "net/http"
)

type Client struct {
	Auth *client.Client

	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		Auth:    client.NewClient(opts...),
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
