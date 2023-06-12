package client

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestExampleClient demonstrates how to use the generated
// client and interacts with a test server.
func TestExampleClient(t *testing.T) {
	server := httptest.NewServer(
		http.HandlerFunc(
			func(w http.ResponseWriter, r *http.Request) {
				// Verify the method and headers are what we expect.
				assert.Equal(t, "POST", r.Method)
				for header, value := range fernHeaders {
					assert.Equal(t, value, r.Header.Get(header))
				}
				assert.Equal(t, "received", r.Header.Get("X-Example-Header"))

				// Verify that we received the query parameters.
				urlValues := r.URL.Query()
				limit, err := strconv.Atoi(urlValues.Get("limit"))
				require.NoError(t, err)
				assert.Equal(t, 10, limit)

				// This is the only registered endpoint for now,
				// so we just check that the path suffix matches.
				assert.True(t, strings.HasSuffix(r.URL.Path, "/example/foo"))

				bytes, err := io.ReadAll(r.Body)
				require.NoError(t, err)

				request := new(FooRequest)
				require.NoError(t, json.Unmarshal(bytes, request))

				if request.Id == "error" {
					// Return a typed error so we can verify the behavior
					// of the error decoder.
					notFoundError := &UserNotFoundError{
						StatusCode:      http.StatusNotFound,
						RequestedUserId: "error",
					}
					bytes, err = json.Marshal(notFoundError)
					require.NoError(t, err)

					w.WriteHeader(http.StatusNotFound)
					_, err = w.Write(bytes)
					require.NoError(t, err)
					return
				}

				response := &FooResponse{
					Id: request.Id,
				}
				bytes, err = json.Marshal(response)
				require.NoError(t, err)

				_, err = w.Write(bytes)
				require.NoError(t, err)
			},
		),
	)
	defer server.Close()

	client, err := NewExampleClient(server.URL, server.Client())
	require.NoError(t, err)

	response, err := client.Foo(
		context.Background(),
		&FooRequest{
			Id:             "fern",
			XExampleHeader: "received",
			Limit:          10,
		},
	)
	require.NoError(t, err)
	assert.Equal(t, "fern", response.Id)

	_, err = client.Foo(
		context.Background(),
		&FooRequest{
			Id:             "error",
			XExampleHeader: "received",
			Limit:          10,
		},
	)
	require.Error(t, err)

	userNotFoundError, ok := err.(*UserNotFoundError)
	require.True(t, ok)
	assert.Equal(t, http.StatusNotFound, userNotFoundError.StatusCode)
	assert.Equal(t, "error", userNotFoundError.RequestedUserId)
}
