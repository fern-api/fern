package service

import (
	context "context"
	fern "github.com/examples/fern"
	core "github.com/examples/fern/core"
	file "github.com/examples/fern/file"
	internal "github.com/examples/fern/internal"
	option "github.com/examples/fern/option"
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

func (r *RawClient) GetFile(
	ctx context.Context,
	// This is a filename
	filename string,
	request *file.GetFileRequest,
	opts ...option.RequestOption,
) (*core.Response[*fern.File], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := internal.EncodeURL(
		baseURL+"/file/%v",
		filename,
	)
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	errorCodes := internal.ErrorCodes{
		404: func(apiError *core.APIError) error {
			return &fern.NotFoundError{
				APIError: apiError,
			}
		},
	}
	var response *fern.File
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
			Request:         request,
			Response:        &response,
			ErrorDecoder:    internal.NewErrorDecoder(errorCodes),
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[*fern.File]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}
