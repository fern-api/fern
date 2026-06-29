package internal

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"reflect"
	"strings"

	"github.com/webhooks/fern/core"
)

const (
	// contentType specifies the JSON Content-Type header value.
	contentType               = "application/json"
	contentTypeHeader         = "Content-Type"
	contentTypeFormURLEncoded = "application/x-www-form-urlencoded"
	maxRedirects              = 20
)

// noRedirectClient wraps an HTTPClient to prevent automatic redirect following.
type noRedirectClient struct {
	inner core.HTTPClient
}

func (c *noRedirectClient) Do(req *http.Request) (*http.Response, error) {
	if httpClient, ok := c.inner.(*http.Client); ok {
		// Create a shallow copy with redirect disabled
		noRedirect := *httpClient
		noRedirect.CheckRedirect = func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		}
		return noRedirect.Do(req)
	}
	return c.inner.Do(req)
}

func urlOrigin(u *url.URL) string {
	port := u.Port()
	if port == "" {
		switch u.Scheme {
		case "https":
			port = "443"
		case "http":
			port = "80"
		}
	}
	return fmt.Sprintf("%s://%s:%s", strings.ToLower(u.Scheme), strings.ToLower(u.Hostname()), port)
}

func isSameOrigin(u1, u2 *url.URL) bool {
	return urlOrigin(u1) == urlOrigin(u2)
}

func isRedirectStatus(code int) bool {
	return code == 301 || code == 302 || code == 303 || code == 307 || code == 308
}

// Caller calls APIs and deserializes their response, if any.
type Caller struct {
	client  core.HTTPClient
	retrier *Retrier
}

// CallerParams represents the parameters used to constrcut a new *Caller.
type CallerParams struct {
	Client         core.HTTPClient
	MaxAttempts    uint
	DisableRetries bool
}

// NewCaller returns a new *Caller backed by the given parameters.
func NewCaller(params *CallerParams) *Caller {
	var httpClient core.HTTPClient = http.DefaultClient
	if params.Client != nil {
		httpClient = params.Client
	}
	return &Caller{
		client:  httpClient,
		retrier: NewRetrier(buildRetryOptions(params.MaxAttempts, params.DisableRetries)...),
	}
}

// CallParams represents the parameters used to issue an API call.
type CallParams struct {
	URL                string
	Method             string
	MaxAttempts        uint
	DisableRetries     bool
	Headers            http.Header
	BodyProperties     map[string]interface{}
	QueryParameters    url.Values
	Client             core.HTTPClient
	Request            interface{}
	Response           interface{}
	ResponseIsOptional bool
	ErrorDecoder       ErrorDecoder
}

// CallResponse is a parsed HTTP response from an API call.
type CallResponse struct {
	StatusCode int
	Header     http.Header
}

// Call issues an API call according to the given call parameters.
func (c *Caller) Call(ctx context.Context, params *CallParams) (*CallResponse, error) {
	callURL := buildURL(params.URL, params.QueryParameters)
	req, err := newRequest(
		ctx,
		callURL,
		params.Method,
		params.Headers,
		params.Request,
		params.BodyProperties,
	)
	if err != nil {
		return nil, err
	}

	// If the call has been cancelled, don't issue the request.
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	client := c.client
	if params.Client != nil {
		// Use the HTTP client scoped to the request.
		client = params.Client
	}

	// Wrap client to disable automatic redirect following
	wrappedClient := &noRedirectClient{inner: client}

	resp, err := c.retrier.Run(
		wrappedClient.Do,
		req,
		params.ErrorDecoder,
		buildRetryOptions(params.MaxAttempts, params.DisableRetries)...,
	)
	if err != nil {
		return nil, err
	}

	// Handle redirects manually to strip auth headers on cross-origin redirects
	authHeaderKeys := make(map[string]bool)
	for key := range params.Headers {
		authHeaderKeys[strings.ToLower(key)] = true
	}

	redirectCount := 0
	for isRedirectStatus(resp.StatusCode) && redirectCount < maxRedirects {
		location := resp.Header.Get("Location")
		if location == "" {
			break
		}
		_ = resp.Body.Close()

		redirectURL, err := req.URL.Parse(location)
		if err != nil {
			break
		}
		redirectCount++

		redirectMethod := req.Method
		var redirectBody io.Reader
		// 301, 302, 303: switch to GET and drop body
		if resp.StatusCode == 301 || resp.StatusCode == 302 || resp.StatusCode == 303 {
			redirectMethod = http.MethodGet
			redirectBody = nil
		} else if req.Body != nil {
			// For 307/308, try to re-read body
			if req.GetBody != nil {
				redirectBody, err = req.GetBody()
				if err != nil {
					break
				}
			}
		}

		redirectReq, err := http.NewRequestWithContext(ctx, redirectMethod, redirectURL.String(), redirectBody)
		if err != nil {
			break
		}

		// Copy headers
		for key, values := range req.Header {
			redirectReq.Header[key] = values
		}

		// Strip auth headers on cross-origin redirects
		if !isSameOrigin(req.URL, redirectURL) {
			for key := range redirectReq.Header {
				if authHeaderKeys[strings.ToLower(key)] {
					redirectReq.Header.Del(key)
				}
			}
		}

		req = redirectReq
		resp, err = wrappedClient.Do(req)
		if err != nil {
			return nil, err
		}
	}

	// Close the response body after we're done.
	defer func() { _ = resp.Body.Close() }()

	// Check if the call was cancelled before we return the error
	// associated with the call and/or unmarshal the response data.
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, decodeError(resp, params.ErrorDecoder)
	}

	// Mutate the response parameter in-place.
	if params.Response != nil {
		if writer, ok := params.Response.(io.Writer); ok {
			_, err = io.Copy(writer, resp.Body)
		} else {
			err = json.NewDecoder(resp.Body).Decode(params.Response)
		}
		if err != nil {
			if err == io.EOF {
				if params.ResponseIsOptional {
					// The response is optional, so we should ignore the
					// io.EOF error
					return &CallResponse{
						StatusCode: resp.StatusCode,
						Header:     resp.Header,
					}, nil
				}
				return nil, fmt.Errorf("expected a %T response, but the server responded with nothing", params.Response)
			}
			return nil, err
		}
	}

	return &CallResponse{
		StatusCode: resp.StatusCode,
		Header:     resp.Header,
	}, nil
}

// buildURL constructs the final URL by appending the given query parameters (if any).
func buildURL(
	url string,
	queryParameters url.Values,
) string {
	if len(queryParameters) == 0 {
		return url
	}
	if strings.ContainsRune(url, '?') {
		url += "&"
	} else {
		url += "?"
	}
	url += queryParameters.Encode()
	return url
}

// newRequest returns a new *http.Request with all of the fields
// required to issue the call.
func newRequest(
	ctx context.Context,
	url string,
	method string,
	endpointHeaders http.Header,
	request interface{},
	bodyProperties map[string]interface{},
) (*http.Request, error) {
	// Determine the content type from headers, defaulting to JSON.
	reqContentType := contentType
	if endpointHeaders != nil {
		if ct := endpointHeaders.Get(contentTypeHeader); ct != "" {
			reqContentType = ct
		}
	}
	requestBody, err := newRequestBody(request, bodyProperties, reqContentType)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, method, url, requestBody)
	if err != nil {
		return nil, err
	}
	req.Header.Set(contentTypeHeader, reqContentType)
	for name, values := range endpointHeaders {
		req.Header[name] = values
	}
	return req, nil
}

// newRequestBody returns a new io.Reader that represents the HTTP request body.
func newRequestBody(request interface{}, bodyProperties map[string]interface{}, reqContentType string) (io.Reader, error) {
	if isNil(request) {
		if len(bodyProperties) == 0 {
			return nil, nil
		}
		if reqContentType == contentTypeFormURLEncoded {
			return newFormURLEncodedBody(bodyProperties), nil
		}
		requestBytes, err := json.Marshal(bodyProperties)
		if err != nil {
			return nil, err
		}
		return bytes.NewReader(requestBytes), nil
	}
	if body, ok := request.(io.Reader); ok {
		return body, nil
	}
	// Handle form URL encoded content type.
	if reqContentType == contentTypeFormURLEncoded {
		return newFormURLEncodedRequestBody(request, bodyProperties)
	}
	requestBytes, err := MarshalJSONWithExtraProperties(request, bodyProperties)
	if err != nil {
		return nil, err
	}
	return bytes.NewReader(requestBytes), nil
}

// newFormURLEncodedBody returns a new io.Reader that represents a form URL encoded body
// from the given body properties map.
func newFormURLEncodedBody(bodyProperties map[string]interface{}) io.Reader {
	values := url.Values{}
	for key, val := range bodyProperties {
		values.Set(key, fmt.Sprintf("%v", val))
	}
	return strings.NewReader(values.Encode())
}

// newFormURLEncodedRequestBody returns a new io.Reader that represents a form URL encoded body
// from the given request struct and body properties.
func newFormURLEncodedRequestBody(request interface{}, bodyProperties map[string]interface{}) (io.Reader, error) {
	values := url.Values{}
	// Marshal the request to JSON first to respect any custom MarshalJSON methods,
	// then unmarshal into a map to extract the field values.
	jsonBytes, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}
	var jsonMap map[string]interface{}
	if err := json.Unmarshal(jsonBytes, &jsonMap); err != nil {
		return nil, err
	}
	// Convert the JSON map to form URL encoded values.
	for key, val := range jsonMap {
		if val == nil {
			continue
		}
		values.Set(key, fmt.Sprintf("%v", val))
	}
	// Add any extra body properties.
	for key, val := range bodyProperties {
		values.Set(key, fmt.Sprintf("%v", val))
	}
	return strings.NewReader(values.Encode()), nil
}

// decodeError decodes the error from the given HTTP response. Note that
// it's the caller's responsibility to close the response body.
func decodeError(response *http.Response, errorDecoder ErrorDecoder) error {
	if errorDecoder != nil {
		// This endpoint has custom errors, so we'll
		// attempt to unmarshal the error into a structured
		// type based on the status code.
		return errorDecoder(response.StatusCode, response.Header, response.Body)
	}
	// This endpoint doesn't have any custom error
	// types, so we just read the body as-is, and
	// put it into a normal error.
	bytes, err := io.ReadAll(response.Body)
	if err != nil && err != io.EOF {
		return err
	}
	if err == io.EOF {
		// The error didn't have a response body,
		// so all we can do is return an error
		// with the status code.
		return core.NewAPIError(response.StatusCode, response.Header, nil)
	}
	return core.NewAPIError(response.StatusCode, response.Header, errors.New(string(bytes)))
}

// isNil is used to determine if the request value is equal to nil (i.e. an interface
// value that holds a nil concrete value is itself non-nil).
func isNil(value interface{}) bool {
	if value == nil {
		return true
	}
	v := reflect.ValueOf(value)
	switch v.Kind() {
	case reflect.Chan, reflect.Func, reflect.Interface, reflect.Map, reflect.Pointer, reflect.Slice:
		return v.IsNil()
	default:
		return false
	}
}
