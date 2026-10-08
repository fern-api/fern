package internal

import (
	"bytes"
	"errors"
	"net/http"
	"testing"

	"github.com/query-parameters/fern/core"
	"github.com/stretchr/testify/assert"
)

func TestErrorDecoder(t *testing.T) {
	decoder := NewErrorDecoder(
		ErrorCodes{
			http.StatusNotFound: func(apiError *core.APIError) error {
				return &InternalTestNotFoundError{APIError: apiError}
			},
		})

	tests := []struct {
		description    string
		giveStatusCode int
		giveHeader     http.Header
		giveBody       string
		wantError      error
	}{
		{
			description:    "unrecognized status code",
			giveStatusCode: http.StatusInternalServerError,
			giveHeader:     http.Header{},
			giveBody:       "Internal Server Error",
			wantError:      core.NewAPIError(http.StatusInternalServerError, http.Header{}, errors.New("Internal Server Error")),
		},
		{
			description:    "not found with valid JSON",
			giveStatusCode: http.StatusNotFound,
			giveHeader:     http.Header{},
			giveBody:       `{"message": "Resource not found"}`,
			wantError: &InternalTestNotFoundError{
				APIError: core.NewAPIError(http.StatusNotFound, http.Header{}, errors.New(`{"message": "Resource not found"}`)),
				Message:  "Resource not found",
			},
		},
		{
			description:    "not found with invalid JSON",
			giveStatusCode: http.StatusNotFound,
			giveHeader:     http.Header{},
			giveBody:       `Resource not found`,
			wantError:      core.NewAPIError(http.StatusNotFound, http.Header{}, errors.New("Resource not found")),
		},
	}

	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			assert.Equal(t, tt.wantError, decoder(tt.giveStatusCode, tt.giveHeader, bytes.NewReader([]byte(tt.giveBody))))
		})
	}
}

// InternalTestClientError represents any 4XX status code.
type InternalTestClientError struct {
	*core.APIError

	Message string `json:"message"`
}

// InternalTestServerError represents any 5XX status code.
type InternalTestServerError struct {
	*core.APIError

	Message string `json:"message"`
}

func TestErrorDecoderWildcards(t *testing.T) {
	decoder := NewErrorDecoder(
		ErrorCodes{
			http.StatusNotFound: func(apiError *core.APIError) error {
				return &InternalTestNotFoundError{APIError: apiError}
			},
			ClientErrorWildcard: func(apiError *core.APIError) error {
				return &InternalTestClientError{APIError: apiError}
			},
			ServerErrorWildcard: func(apiError *core.APIError) error {
				return &InternalTestServerError{APIError: apiError}
			},
		})

	tests := []struct {
		description    string
		giveStatusCode int
		giveBody       string
		wantError      error
	}{
		{
			description:    "undeclared 4XX uses the client wildcard",
			giveStatusCode: http.StatusTooManyRequests,
			giveBody:       `{"message": "Rate limited"}`,
			wantError: &InternalTestClientError{
				APIError: core.NewAPIError(http.StatusTooManyRequests, http.Header{}, errors.New(`{"message": "Rate limited"}`)),
				Message:  "Rate limited",
			},
		},
		{
			description:    "undeclared 5XX uses the server wildcard",
			giveStatusCode: http.StatusBadGateway,
			giveBody:       `{"message": "Upstream failed"}`,
			wantError: &InternalTestServerError{
				APIError: core.NewAPIError(http.StatusBadGateway, http.Header{}, errors.New(`{"message": "Upstream failed"}`)),
				Message:  "Upstream failed",
			},
		},
		{
			description:    "concrete status code takes precedence over the wildcard",
			giveStatusCode: http.StatusNotFound,
			giveBody:       `{"message": "Resource not found"}`,
			wantError: &InternalTestNotFoundError{
				APIError: core.NewAPIError(http.StatusNotFound, http.Header{}, errors.New(`{"message": "Resource not found"}`)),
				Message:  "Resource not found",
			},
		},
		{
			description:    "wildcard with malformed body falls back to the API error",
			giveStatusCode: http.StatusForbidden,
			giveBody:       `<html><body>Forbidden</body></html>`,
			wantError:      core.NewAPIError(http.StatusForbidden, http.Header{}, errors.New(`<html><body>Forbidden</body></html>`)),
		},
		{
			description:    "range boundaries are inclusive",
			giveStatusCode: 599,
			giveBody:       `{"message": "Network timeout"}`,
			wantError: &InternalTestServerError{
				APIError: core.NewAPIError(599, http.Header{}, errors.New(`{"message": "Network timeout"}`)),
				Message:  "Network timeout",
			},
		},
		{
			description:    "status codes outside 4XX and 5XX never match a wildcard",
			giveStatusCode: http.StatusMovedPermanently,
			giveBody:       `{"message": "Moved"}`,
			wantError:      core.NewAPIError(http.StatusMovedPermanently, http.Header{}, errors.New(`{"message": "Moved"}`)),
		},
		{
			description:    "wildcard keys are not matched as literal status codes",
			giveStatusCode: ClientErrorWildcard,
			giveBody:       `{"message": "Bogus"}`,
			wantError:      core.NewAPIError(ClientErrorWildcard, http.Header{}, errors.New(`{"message": "Bogus"}`)),
		},
	}

	for _, tt := range tests {
		t.Run(tt.description, func(t *testing.T) {
			assert.Equal(t, tt.wantError, decoder(tt.giveStatusCode, http.Header{}, bytes.NewReader([]byte(tt.giveBody))))
		})
	}
}
