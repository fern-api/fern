package completions

import (
	core "github.com/server-sent-events/fern/core"
	internal "github.com/server-sent-events/fern/internal"
	option "github.com/server-sent-events/fern/option"
	http "net/http"
)

type RawClient struct {
	baseURL string
	caller  *internal.Caller
	header  http.Header
}

func NewRawClient(opts ...option.RequestOption) *RawClient {
	options := core.NewRequestOptions(opts...)
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
