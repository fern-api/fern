package service

import (
	bytes "bytes"
	context "context"
	core "github.com/plain-text/fern/core"
	internal "github.com/plain-text/fern/internal"
	option "github.com/plain-text/fern/option"
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

func (r *RawClient) GetText(
	ctx context.Context,
	opts ...option.RequestOption,
) (*core.Response[string], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/text"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	response := bytes.NewBuffer(nil)
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
			Response:        response,
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[string]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response.String(),
	}, nil
}
