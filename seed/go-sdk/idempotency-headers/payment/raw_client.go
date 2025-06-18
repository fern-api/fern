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
	opts ...option.RequestOption,
) (uuid.UUID, error) {
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
}
