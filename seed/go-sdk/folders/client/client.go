// Code generated by Fern. DO NOT EDIT.

package client

import (
	context "context"
	client "github.com/folders/fern/a/client"
	core "github.com/folders/fern/core"
	folderclient "github.com/folders/fern/folder/client"
	internal "github.com/folders/fern/internal"
	option "github.com/folders/fern/option"
	http "net/http"
)

type Client struct {
	WithRawResponse *RawClient
	A               *client.Client
	Folder          *folderclient.Client

	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		A:               client.NewClient(opts...),
		Folder:          folderclient.NewClient(opts...),
		WithRawResponse: NewRawClient(options),
		baseURL:         options.BaseURL,
		caller: internal.NewCaller(
			&internal.CallerParams{
				Client:      options.HTTPClient,
				MaxAttempts: options.MaxAttempts,
			},
		),
		header: options.ToHeader(),
	}
}

func (c *Client) Foo(
	ctx context.Context,
	opts ...option.RequestOption,
) error {
	_, err := c.WithRawResponse.Foo(
		ctx,
		opts...,
	)
	if err != nil {
		return err
	}
	return nil
}
