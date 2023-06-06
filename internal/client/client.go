package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

const (
	// contentType specifies the JSON Content-Type header value.
	contentType = "application/json"

	// fernLanguage specifies the value of the X-Fern-Language header.
	fernLanguage = "go"

	// fernSDKName specifies the name of this Fern SDK.
	fernSDKName = "fern-go-client"

	// fernSDKVersion specifies the version of this Fern SDK.
	fernSDKVersion = "0.0.1"
)

// Doer is an interface for a subset of the *http.Client.
type Doer interface {
	Do(*http.Request) (*http.Response, error)
}

// doRequest issues a JSON request to the given url.
func doRequest(
	ctx context.Context,
	client Doer,
	url string,
	method string,
	request any,
	response any,
) error {
	requestBytes, err := json.Marshal(request)
	if err != nil {
		return err
	}
	req, err := newRequest(ctx, url, method, bytes.NewReader(requestBytes))
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
	if err = ctx.Err(); err != nil {
		return err
	}

	if resp.StatusCode != 200 {
		// TODO: Read the error from the response.
		// This will sometimes (and ideally) be a
		// structured Fern error.
		return errors.New("TODO: error in response")
	}

	// Mutate the resposne parameter in-place.
	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(response); err != nil {
		return err
	}

	return nil
}

// newRequest returns a new *http.Request with all of the fields
// required to issue the call.
func newRequest(
	ctx context.Context,
	url string,
	method string,
	requestBody io.Reader,
) (*http.Request, error) {
	req, err := http.NewRequest(method, url, requestBody)
	if err != nil {
		return nil, err
	}
	req = req.WithContext(ctx)
	req.Header.Set("Accept", contentType)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("X-Fern-Language", fernLanguage)
	req.Header.Set("X-Fern-SDK-Name", fernSDKName)
	req.Header.Set("X-Fern-SDK-Version", fernSDKVersion)
	return req, nil
}
