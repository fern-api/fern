// Code generated by Fern. DO NOT EDIT.

package headers

import (
	context "context"
	fern "github.com/enum/fern"
	core "github.com/enum/fern/core"
	internal "github.com/enum/fern/internal"
	option "github.com/enum/fern/option"
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

func (r *RawClient) Send(
	ctx context.Context,
	request *fern.SendEnumAsHeaderRequest,
	opts ...option.RequestOption,
) (*core.Response[any], error) {
	options := core.NewRequestOptions(opts...)
	baseURL := internal.ResolveBaseURL(
		options.BaseURL,
		r.baseURL,
		"",
	)
	endpointURL := baseURL + "/headers"
	headers := internal.MergeHeaders(
		r.header.Clone(),
		options.ToHeader(),
	)
	headers.Add("operand", string(request.Operand))
	if request.MaybeOperand != nil {
		headers.Add("maybeOperand", string(*request.MaybeOperand))
	}
	headers.Add("operandOrColor", request.OperandOrColor)
	if request.MaybeOperandOrColor != nil {
		headers.Add("maybeOperandOrColor", request.MaybeOperandOrColor)
	}

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
		},
	)
	if err != nil {
		return nil, err
	}
	return &core.Response[any]{
		StatusCode: raw.StatusCode,
		Header:     raw.Header,
		Body:       nil,
	}, nil
}
