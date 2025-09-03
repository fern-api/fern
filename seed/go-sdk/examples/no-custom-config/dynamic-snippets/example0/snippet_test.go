package example

import (
	"context"
	"net/http"
	"testing"

	client "github.com/examples/fern/client"
	option "github.com/examples/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/wiremock/go-wiremock"
)

// TestEchoWithWireMock demonstrates mocking the same Echo call from the dynamic snippet using WireMock
func TestEchoWithWireMock(t *testing.T) {
	// Create WireMock client
	wiremockClient := wiremock.NewClient("http://localhost:8080")

	// Reset WireMock to clean state
	err := wiremockClient.Reset()
	require.NoError(t, err, "Failed to reset WireMock")

	// Create a mock response for the Echo endpoint that matches the exact input from the snippet
	stub := wiremock.Post(wiremock.URLEqualTo("/")).
		WithBodyPattern(wiremock.EqualTo(`"Hello world!\n\nwith\n\tnewlines"`)).
		WillReturnResponse(
			wiremock.NewResponse().
				WithStatus(http.StatusOK).
				WithHeader("Content-Type", "application/json").
				WithBody(`"Echo: Hello world!\n\nwith\n\tnewlines"`),
		)

	// Register the stub with WireMock
	err = wiremockClient.StubFor(stub)
	require.NoError(t, err, "Failed to create WireMock stub")

	// Create client pointing to WireMock server instead of real API
	client := client.NewClient(
		option.WithBaseURL("http://localhost:8080"), // WireMock server URL
		// Note: Token not needed for WireMock testing
	)

	// Make the same Echo call as in the snippet, but now it will be mocked
	response, err := client.Echo(
		context.TODO(),
		"Hello world!\n\nwith\n\tnewlines",
	)

	// Verify the call succeeded
	require.NoError(t, err, "Echo call should succeed with WireMock")
	assert.Equal(t, "Echo: Hello world!\n\nwith\n\tnewlines", response, "Response should match mocked response")

	// Verify that the request was made as expected
	verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
	require.NoError(t, err, "Failed to verify request")
	assert.True(t, verifyResult, "Request should be verified - mock was called exactly once")

	// Clean up the stub
	err = wiremockClient.DeleteStub(stub)
	require.NoError(t, err, "Failed to delete stub")
}

// TestEchoWithWireMockMultipleScenarios tests various response scenarios
func TestEchoWithWireMockMultipleScenarios(t *testing.T) {
	wiremockClient := wiremock.NewClient("http://localhost:8080")

	t.Run("Success_Response", func(t *testing.T) {
		// Reset for each subtest
		err := wiremockClient.Reset()
		require.NoError(t, err)

		// Success case
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.EqualTo(`"success test"`)).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Success: success test"`),
			)

		err = wiremockClient.StubFor(stub)
		require.NoError(t, err)

		client := client.NewClient(option.WithBaseURL("http://localhost:8080"))
		response, err := client.Echo(context.TODO(), "success test")

		require.NoError(t, err)
		assert.Equal(t, "Success: success test", response)

		// Verify request
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult)
	})

	t.Run("Server_Error_Response", func(t *testing.T) {
		// Reset for each subtest
		err := wiremockClient.Reset()
		require.NoError(t, err)

		// Server error case
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.EqualTo(`"error test"`)).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusInternalServerError).
					WithHeader("Content-Type", "text/plain").
					WithBody("Internal Server Error"),
			)

		err = wiremockClient.StubFor(stub)
		require.NoError(t, err)

		client := client.NewClient(option.WithBaseURL("http://localhost:8080"))
		response, err := client.Echo(context.TODO(), "error test")

		// Should get an error for server error response
		assert.Error(t, err, "Should get error for server error response")
		assert.Empty(t, response, "Response should be empty on error")

		// Verify request was still made
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult)
	})

	t.Run("JSON_Pattern_Matching", func(t *testing.T) {
		// Reset for each subtest
		err := wiremockClient.Reset()
		require.NoError(t, err)

		// More flexible pattern matching - any string containing "pattern"
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.Matching(`.*pattern.*`)).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Matched pattern"`),
			)

		err = wiremockClient.StubFor(stub)
		require.NoError(t, err)

		client := client.NewClient(option.WithBaseURL("http://localhost:8080"))
		response, err := client.Echo(context.TODO(), "test pattern matching")

		require.NoError(t, err)
		assert.Equal(t, "Matched pattern", response)

		// Verify request
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult)
	})
}
