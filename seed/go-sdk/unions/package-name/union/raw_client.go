package union

import (
	context "context"
	unions "github.com/fern-api/unions-go"
	core "github.com/fern-api/unions-go/core"
	internal "github.com/fern-api/unions-go/internal"
	option "github.com/fern-api/unions-go/option"
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
	id string,
	opts ...option.RequestOption,
) (*core.Response[*unions.Shape], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := internal.EncodeURL(
		baseURL+"/%v",
		id,
	)
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response *unions.Shape
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
			Response:        &response,
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[*unions.Shape]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}

func (r *RawClient) Update(
	ctx context.Context,
	request *unions.Shape,
	opts ...option.RequestOption,
) (*core.Response[bool], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response bool
	raw, err := r.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPatch,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
			Request:         request,
			Response:        &response,
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[bool]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}
