package union

import (
	context "context"
	undiscriminated "github.com/fern-api/undiscriminated-go"
	core "github.com/fern-api/undiscriminated-go/core"
	internal "github.com/fern-api/undiscriminated-go/internal"
	option "github.com/fern-api/undiscriminated-go/option"
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
	request *undiscriminated.MyUnion,
	opts ...option.RequestOption,
) (*core.Response[*undiscriminated.MyUnion], error) {
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
	var response *undiscriminated.MyUnion
	raw, err := r.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
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
	return &core.Response[*undiscriminated.MyUnion]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}

func (r *RawClient) GetMetadata(
	ctx context.Context,
	opts ...option.RequestOption,
) (*core.Response[undiscriminated.Metadata], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/metadata"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response undiscriminated.Metadata
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
	return &core.Response[undiscriminated.Metadata]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}

func (r *RawClient) UpdateMetadata(
	ctx context.Context,
	request *undiscriminated.MetadataUnion,
	opts ...option.RequestOption,
) (*core.Response[bool], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/metadata"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response bool
	raw, err := r.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPut,
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

func (r *RawClient) Call(
	ctx context.Context,
	request *undiscriminated.Request,
	opts ...option.RequestOption,
) (*core.Response[bool], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/call"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response bool
	raw, err := r.caller.Call(
		ctx,
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodPost,
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
