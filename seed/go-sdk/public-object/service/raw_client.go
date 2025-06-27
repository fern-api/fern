package service

import (
	bytes "bytes"
	context "context"
	core "github.com/public-object/fern/core"
	internal "github.com/public-object/fern/internal"
	option "github.com/public-object/fern/option"
	io "io"
	http "net/http"
)

type RawClient struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewRawClient(options *core.RequestOptions) *RawClient {
	return &RawClient{
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

func (r *RawClient) Get(
	ctx context.Context,
	opts ...option.RequestOption,
) (*core.Response[io.Reader], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/helloworld.txt"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	response := bytes.NewBuffer(nil)
	raw, err := r.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodGet,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Response:        response,
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[io.Reader]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}
