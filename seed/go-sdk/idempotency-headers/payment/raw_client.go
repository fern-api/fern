package payment

import (
    internal "github.com/idempotency-headers/fern/internal"
    http "net/http"
    option "github.com/idempotency-headers/fern/option"
    core "github.com/idempotency-headers/fern/core"
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
