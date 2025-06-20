package payment

import (
	context "context"
	uuid "github.com/google/uuid"
	fern "github.com/idempotency-headers/fern"
	core "github.com/idempotency-headers/fern/core"
	internal "github.com/idempotency-headers/fern/internal"
	option "github.com/idempotency-headers/fern/option"
	http "net/http"
)

type RawClient struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewRawClient(opts ...option.RequestOption) *RawClient {
	options := core.NewRequestOptions(
		opts...,
	)
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

func (r RawClient) Create(
	ctx context.Context,
	request *fern.CreatePaymentRequest,
	opts ...option.IdempotentRequestOption,
) (*core.Response[uuid.UUID], error) {
	options := core.NewRequestOptions(
		opts...,
	)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/payment"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	var response uuid.UUID
	raw, err := r.caller.Call(
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
		return uuid.UUID{}, err
	}
	return &core.Response[uuid.UUID]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}

func (r RawClient) Delete(
	ctx context.Context,
	paymentId string,
	opts ...option.RequestOption,
) error {
	options := core.NewRequestOptions(
		opts...,
	)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/payment/%v"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	_, err := r.caller.Call(
		&internal.CallParams{
			URL:             endpointURL,
			Method:          http.MethodDelete,
			Headers:         headers,
			MaxAttempts:     options.MaxAttempts,
			BodyProperties:  options.BodyProperties,
			QueryParameters: options.QueryParameters,
			Client:          options.HTTPClient,
		},
	)
	if err != nil {
		return err
	}
	return nil
}
