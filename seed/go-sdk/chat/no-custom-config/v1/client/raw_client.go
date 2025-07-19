package client

import (
	context "context"
	core "github.com/chat/fern/core"
	internal "github.com/chat/fern/internal"
	option "github.com/chat/fern/option"
	v1 "github.com/chat/fern/v1"
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

func (r *RawClient) Chat(
	ctx context.Context,
	request *v1.ChatRequest,
	opts ...option.RequestOption,
) (*core.Response[[]string], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"https://api.cohere.com",
	)
	endpointURL := baseURL + "/v1/chat"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	if request.Accepts != nil {

		headers.Add("Accepts", request.Accepts)
	}

	headers.Add("Content-Type", "application/json")
	errorCodes := internal.ErrorCodes{
		400: func(apiError *core.APIError) error {
			return &v1.BadRequestError{
				APIError: apiError,
			}
		},
		401: func(apiError *core.APIError) error {
			return &v1.UnauthorizedError{
				APIError: apiError,
			}
		},
		403: func(apiError *core.APIError) error {
			return &v1.ForbiddenError{
				APIError: apiError,
			}
		},
		404: func(apiError *core.APIError) error {
			return &v1.NotFoundError{
				APIError: apiError,
			}
		},
		422: func(apiError *core.APIError) error {
			return &v1.UnprocessableEntityError{
				APIError: apiError,
			}
		},
		429: func(apiError *core.APIError) error {
			return &v1.TooManyRequestsError{
				APIError: apiError,
			}
		},
		498: func(apiError *core.APIError) error {
			return &v1.InvalidTokenError{
				APIError: apiError,
			}
		},
		499: func(apiError *core.APIError) error {
			return &v1.ClientClosedRequestError{
				APIError: apiError,
			}
		},
		500: func(apiError *core.APIError) error {
			return &v1.InternalServerError{
				APIError: apiError,
			}
		},
		501: func(apiError *core.APIError) error {
			return &v1.NotImplementedError{
				APIError: apiError,
			}
		},
		503: func(apiError *core.APIError) error {
			return &v1.ServiceUnavailableError{
				APIError: apiError,
			}
		},
		504: func(apiError *core.APIError) error {
			return &v1.GatewayTimeoutError{
				APIError: apiError,
			}
		},
	}
	var response []string
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
			ErrorDecoder:    internal.NewErrorDecoder(errorCodes),
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[[]string]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       response,
	}, nil
}
