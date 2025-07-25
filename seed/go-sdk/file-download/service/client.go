// Code generated by Fern. DO NOT EDIT.

package service

import (
	context "context"
	core "github.com/file-download/fern/core"
	internal "github.com/file-download/fern/internal"
	option "github.com/file-download/fern/option"
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

func (c *Client) Simple(
	ctx context.Context,
	opts ...option.RequestOption,
) error {
	_, err := c.WithRawResponse.Simple(
		ctx,
		opts...,
	)
	if err != nil {
		return err
	}
	return nil
}

func (c *Client) DownloadFile(
	ctx context.Context,
	opts ...option.RequestOption,
) (io.Reader, error) {
	response, err := c.WithRawResponse.DownloadFile(
		ctx,
		opts...,
	)
	if err != nil {
		return nil, err
	}
	return response.Body, nil
}
