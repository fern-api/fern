package client

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
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
				assert.Equal(t, "GET", r.Method)
				for header, value := range fernHeaders {
					assert.Equal(t, value, r.Header.Get(header))
				}

				// This is the only registered endpoint for now,
				// so we just check that the path suffix matches.
				assert.True(t, strings.HasSuffix(r.URL.Path, "/example/foo"))

				bytes, err := io.ReadAll(r.Body)
				require.NoError(t, err)

				request := new(FooRequest)
				require.NoError(t, json.Unmarshal(bytes, request))

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
			Id: "fern",
		},
	)
	require.NoError(t, err)

	assert.Equal(t, "fern", response.Id)
}
