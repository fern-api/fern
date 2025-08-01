// Code generated by Fern. DO NOT EDIT.

package service

import (
	context "context"
	core "github.com/bytes-upload/fern/core"
	internal "github.com/bytes-upload/fern/internal"
	option "github.com/bytes-upload/fern/option"
	io "io"
	http "net/http"
)

type Client struct {
	WithRawResponse *RawClient

	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
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

func (c *Client) Upload(
	ctx context.Context,
	request io.Reader,
	opts ...option.RequestOption,
) error {
	_, err := c.WithRawResponse.Upload(
		ctx,
		request,
		opts...,
	)
	if err != nil {
		return err
	}
	return nil
}
