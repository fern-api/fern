package service

import (
    internal "github.com/content-type/fern/internal"
    http "net/http"
    option "github.com/content-type/fern/option"
    core "github.com/content-type/fern/core"
    context "context"
    fern "github.com/content-type/fern"
)

type RawClient struct {
    baseURL string
    caller *internal.Caller
    header http.Header
}

func NewRawClient(opts ...option.RequestOption) *RawClient {
    options := core.NewRequestOptions(opts...)
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

func (r *RawClient) Patch(
    ctx context.Context,
    request *fern.PatchProxyRequest,
    opts ...option.RequestOption,
) (*core.Response[any], error){
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
    )headers.Add("Content-Type", "application/merge-patch+json")

    raw, err := r.caller.Call(
        ctx,
        &internal.CallParams{
            URL: endpointURL,
            Method: http.MethodPatch,
            Headers: headers,
            MaxAttempts: options.MaxAttempts,
            BodyProperties: options.BodyProperties,
            QueryParameters: options.QueryParameters,
            Client: options.HTTPClient,
            Request: request,
        },
    )
    if err != nil {
        return nil, err
    }
    return &core.Response[any]{
        StatusCode: raw.StatusCode,
        Header: raw.Header,
        Body: nil,
    }, nil
}
