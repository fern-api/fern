// Code generated by Fern. DO NOT EDIT.

package api

import (
	core "github.com/imdb/fern/core"
	internal "github.com/imdb/fern/internal"
	option "github.com/imdb/fern/option"
	http "net/http"
)

type Client struct {
	Imdb *ImdbClient

	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewClient(opts ...option.RequestOption) *Client {
	options := core.NewRequestOptions(opts...)
	return &Client{
		Imdb:    NewImdbClient(opts...),
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
