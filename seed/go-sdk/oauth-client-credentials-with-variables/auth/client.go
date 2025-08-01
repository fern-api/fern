// Code generated by Fern. DO NOT EDIT.

package auth

import (
	context "context"
	fern "github.com/oauth-client-credentials-with-variables/fern"
	core "github.com/oauth-client-credentials-with-variables/fern/core"
	internal "github.com/oauth-client-credentials-with-variables/fern/internal"
	option "github.com/oauth-client-credentials-with-variables/fern/option"
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

func (c *Client) GetTokenWithClientCredentials(
	ctx context.Context,
	request *fern.GetTokenRequest,
	opts ...option.RequestOption,
) (*fern.TokenResponse, error) {
	response, err := c.WithRawResponse.GetTokenWithClientCredentials(
		ctx,
		request,
		opts...,
	)
	if err != nil {
		return nil, err
	}
	return response.Body, nil
}

func (c *Client) RefreshToken(
	ctx context.Context,
	request *fern.RefreshTokenRequest,
	opts ...option.RequestOption,
) (*fern.TokenResponse, error) {
	response, err := c.WithRawResponse.RefreshToken(
		ctx,
		request,
		opts...,
	)
	if err != nil {
		return nil, err
	}
	return response.Body, nil
}
