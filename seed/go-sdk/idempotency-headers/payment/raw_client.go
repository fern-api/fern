package payment

import (
    internal "github.com/idempotency-headers/fern/internal"
    http "net/http"
    option "github.com/idempotency-headers/fern/option"
    core "github.com/idempotency-headers/fern/core"
    context "context"
    fern "github.com/idempotency-headers/fern"
    uuid "github.com/google/uuid"
)

type RawClient struct {
    baseURL string
    caller *internal.Caller
    header http.Header
}

func NewRawClient(opts ...option.RequestOption) *RawClient {
    options := core.NewRequestOptions(
        opts...,
    )
    return &RawClient{
        baseURL: options.BaseURL,
        caller: internal.NewCaller(
            &internal.CallerParams{
                Client: options.HTTPClient,
                MaxAttempts: options.MaxAttempts,
            },
        ),
        header: options.ToHeader(),
    }
}

func (r RawClient) Create(
ctx context.Context,
request *fern.CreatePaymentRequest,
opts option.RequestOption,
)(uuid.UUID, error) {
    return nil
}

func (r RawClient) Delete(
ctx context.Context,
paymentId string,
opts option.RequestOption,
)(error) {
    return nil
}

