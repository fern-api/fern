// This file was auto-generated by Fern from our API Definition.

package user

import (
	context "context"
	fixtures "github.com/fern-api/fern-go/internal/testdata/sdk/optional-response/fixtures"
	core "github.com/fern-api/fern-go/internal/testdata/sdk/optional-response/fixtures/core"
	internal "github.com/fern-api/fern-go/internal/testdata/sdk/optional-response/fixtures/internal"
	option "github.com/fern-api/fern-go/internal/testdata/sdk/optional-response/fixtures/option"
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

func (c *Client) GetName(
	ctx context.Context,
	userId string,
	opts ...option.RequestOption,
) (*string, error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := internal.EncodeURL(
		baseURL+"/users/%v/name",
		userId,
	)
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)

	var response *string
	if err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:                endpointURL,
			Method:             http.MethodGet,
			Headers:            headers,
			MaxAttempts:        options.MaxAttempts,
			BodyProperties:     options.BodyProperties,
			QueryParameters:    options.QueryParameters,
			Client:             options.HTTPClient,
			Response:           &response,
			ResponseIsOptional: true,
		},
	); err != nil {
		return nil, err
	}
	return response, nil
}

func (c *Client) GetUser(
	ctx context.Context,
	userId string,
	opts ...option.RequestOption,
) (*fixtures.User, error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		c.baseURL,
		"",
	)
	endpointURL := internal.EncodeURL(
		baseURL+"/users/%v",
		userId,
	)
	headers := internal.MergeHeaders(
		c.header.Clone(),
		options.ToHeader(),
	)

	var response *fixtures.User
	if err := c.caller.Call(
		ctx,
		&internal.CallParams{
			URL:                endpointURL,
			Method:             http.MethodGet,
			Headers:            headers,
			MaxAttempts:        options.MaxAttempts,
			BodyProperties:     options.BodyProperties,
			QueryParameters:    options.QueryParameters,
			Client:             options.HTTPClient,
			Response:           &response,
			ResponseIsOptional: true,
		},
	); err != nil {
		return nil, err
	}
	return response, nil
}
