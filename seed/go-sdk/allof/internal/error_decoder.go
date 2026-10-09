package internal

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/allof/fern/core"
)

// ErrorCodes maps HTTP status codes to error constructors.
//
// In addition to concrete status codes, the map may contain the
// ClientErrorWildcard and ServerErrorWildcard keys, which match any
// 4XX or 5XX status code (respectively) that has no concrete entry.
type ErrorCodes map[int]func(*core.APIError) error

const (
	// ClientErrorWildcard is the ErrorCodes key that matches any 4XX status code
	// not explicitly present in the map.
	ClientErrorWildcard = 4

	// ServerErrorWildcard is the ErrorCodes key that matches any 5XX status code
	// not explicitly present in the map.
	ServerErrorWildcard = 5
)

// ErrorDecoder decodes *http.Response errors and returns a
// typed API error (e.g. *core.APIError).
type ErrorDecoder func(statusCode int, header http.Header, body io.Reader) error

// NewErrorDecoder returns a new ErrorDecoder backed by the given error codes.
// errorCodesOverrides is optional and will be merged with the default error codes,
// with overrides taking precedence.
func NewErrorDecoder(errorCodes ErrorCodes, errorCodesOverrides ...ErrorCodes) ErrorDecoder {
	// Merge default error codes with overrides
	mergedErrorCodes := make(ErrorCodes)

	// Start with default error codes
	for statusCode, errorFunc := range errorCodes {
		mergedErrorCodes[statusCode] = errorFunc
	}

	// Apply overrides if provided
	if len(errorCodesOverrides) > 0 && errorCodesOverrides[0] != nil {
		for statusCode, errorFunc := range errorCodesOverrides[0] {
			mergedErrorCodes[statusCode] = errorFunc
		}
	}

	return func(statusCode int, header http.Header, body io.Reader) error {
		raw, err := io.ReadAll(body)
		if err != nil {
			return fmt.Errorf("failed to read error from response body: %w", err)
		}
		apiError := core.NewAPIError(
			statusCode,
			header,
			errors.New(string(raw)),
		)
		newErrorFunc, ok := lookupErrorFunc(mergedErrorCodes, statusCode)
		if !ok {
			// This status code isn't recognized, so we return
			// the API error as-is.
			return apiError
		}
		customError := newErrorFunc(apiError)
		if err := json.NewDecoder(bytes.NewReader(raw)).Decode(customError); err != nil {
			// If we fail to decode the error, we return the
			// API error as-is.
			return apiError
		}
		return customError
	}
}

// lookupErrorFunc returns the error constructor for the given status code.
// A concrete status code always takes precedence over a wildcard; wildcards
// only apply to status codes in the 4XX and 5XX ranges.
func lookupErrorFunc(errorCodes ErrorCodes, statusCode int) (func(*core.APIError) error, bool) {
	if statusCode < 100 {
		// Not a valid HTTP status code; never match a wildcard key literally.
		return nil, false
	}
	if errorFunc, ok := errorCodes[statusCode]; ok {
		return errorFunc, true
	}
	if statusCode < 400 || statusCode > 599 {
		return nil, false
	}
	errorFunc, ok := errorCodes[statusCode/100]
	return errorFunc, ok
}
