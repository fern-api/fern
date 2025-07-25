// Code generated by Fern. DO NOT EDIT.

package client

import (
	core "github.com/imdb/fern/core"
	imdb "github.com/imdb/fern/imdb"
	internal "github.com/imdb/fern/internal"
	option "github.com/imdb/fern/option"
	http "net/http"
)

type Client struct {
	Imdb *imdb.Client

	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		Imdb:    imdb.NewClient(opts...),
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
