package core

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

const (
	// contentType specifies the JSON Content-Type header value.
	contentType       = "application/json"
	contentTypeHeader = "Content-Type"
)

// HTTPClient is an interface for a subset of the *http.Client.
type HTTPClient interface {
	Do(*http.Request) (*http.Response, error)
}

// APIError is a lightweight wrapper around the standard error
// interface that preserves the status code from the RPC, if any.
type APIError struct {
	err error

	StatusCode int `json:"-"`
}

// NewAPIError constructs a new API error.
func NewAPIError(statusCode int, err error) *APIError {
	return &APIError{
		err:        err,
		StatusCode: statusCode,
	}
}

// Unwrap returns the underlying error. This also makes the error compatible
// with errors.As and errors.Is.
func (a *APIError) Unwrap() error {
	if a == nil {
		return nil
	}
	return a.err
}

// Error returns the API error's message.
func (a *APIError) Error() string {
	if a == nil || (a.err == nil && a.StatusCode == 0) {
		return ""
	}
	if a.err == nil {
		return fmt.Sprintf("%d", a.StatusCode)
	}
	if a.StatusCode == 0 {
		return a.err.Error()
	}
	return fmt.Sprintf("%d: %s", a.StatusCode, a.err.Error())
}

// ErrorDecoder decodes *http.Response errors and returns a
// typed API error (e.g. *APIError).
type ErrorDecoder func(statusCode int, body io.Reader) error

// DoRequest issues a JSON request to the given url.
func DoRequest(
	ctx context.Context,
	client HTTPClient,
	url string,
	method string,
	request any,
	response any,
	responseIsOptional bool,
	endpointHeaders http.Header,
	errorDecoder ErrorDecoder,
) error {
	var requestBody io.Reader
	if request != nil {
		if body, ok := request.(io.Reader); ok {
			requestBody = body
		} else {
			requestBytes, err := json.Marshal(request)
			if err != nil {
				return err
			}
			requestBody = bytes.NewReader(requestBytes)
		}
	}
	req, err := newRequest(ctx, url, method, endpointHeaders, requestBody)
	if err != nil {
		return err
	}

	// If the call has been cancelled, don't issue the request.
	if err := ctx.Err(); err != nil {
		return err
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}

	// Close the response body after we're done.
	defer resp.Body.Close()

	// Check if the call was cancelled before we return the error
	// associated with the call and/or unmarshal the response data.
	if err := ctx.Err(); err != nil {
		return err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if errorDecoder != nil {
			// This endpoint has custom errors, so we'll
			// attempt to unmarshal the error into a structured
			// type based on the status code.
			return errorDecoder(resp.StatusCode, resp.Body)
		}
		// This endpoint doesn't have any custom error
		// types, so we just read the body as-is, and
		// put it into a normal error.
		bytes, err := io.ReadAll(resp.Body)
		if err != nil && err != io.EOF {
			return err
		}
		if err == io.EOF {
			// The error didn't have a response body,
			// so all we can do is return an error
			// with the status code.
			return NewAPIError(resp.StatusCode, nil)
		}
		return NewAPIError(resp.StatusCode, errors.New(string(bytes)))
	}

	// Mutate the response parameter in-place.
	if response != nil {
		if writer, ok := response.(io.Writer); ok {
			_, err = io.Copy(writer, resp.Body)
		} else {
			err = json.NewDecoder(resp.Body).Decode(response)
		}
		if err != nil {
			if err == io.EOF {
				if responseIsOptional {
					// The response is optional, so we should ignore the
					// io.EOF error
					return nil
				}
				return fmt.Errorf("expected a %T response, but the server responded with nothing", response)
			}
			return err
		}
	}

	return nil
}

// newRequest returns a new *http.Request with all of the fields
// required to issue the call.
func newRequest(
	ctx context.Context,
	url string,
	method string,
	endpointHeaders http.Header,
	requestBody io.Reader,
) (*http.Request, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, requestBody)
	if err != nil {
		return nil, err
	}
	req = req.WithContext(ctx)
	req.Header.Set(contentTypeHeader, contentType)
	for name, values := range endpointHeaders {
		req.Header[name] = values
	}
	return req, nil
}
