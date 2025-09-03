package client

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	fern "github.com/examples/fern"
	"github.com/examples/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/wiremock/go-wiremock"
)

// TestSimpleWireMockIntegration demonstrates basic WireMock usage
func TestSimpleWireMockIntegration(t *testing.T) {
	// Create WireMock client
	wiremockClient := wiremock.NewClient("http://localhost:8080")
	
	// Create Fern client pointing to WireMock
	client := NewClient(
		option.WithBaseURL("http://localhost:8080"),
	)
	
	t.Run("Echo_Success_Simple", func(t *testing.T) {
		// Reset WireMock
		err := wiremockClient.Reset()
		require.NoError(t, err, "Failed to reset WireMock")
		
		// Create a simple stub for Echo
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.EqualTo(`"Hello, WireMock!"`)).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Hello, WireMock! (echoed)"`),
			)
		
		err = wiremockClient.StubFor(stub)
		require.NoError(t, err, "Failed to create stub")
		
		// Test the Echo method
		response, err := client.Echo(context.Background(), "Hello, WireMock!")
		require.NoError(t, err)
		assert.Equal(t, "Hello, WireMock! (echoed)", response)
		
		// Verify the request was made
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult, "Request verification failed")
	})
	
	t.Run("Echo_ServerError_Simple", func(t *testing.T) {
		// Reset WireMock
		err := wiremockClient.Reset()
		require.NoError(t, err)
		
		// Create a stub that returns an error
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusInternalServerError).
					WithHeader("Content-Type", "text/plain").
					WithBody("Internal Server Error"),
			)
		
		err = wiremockClient.StubFor(stub)
		require.NoError(t, err)
		
		// Test error handling
		response, err := client.Echo(context.Background(), "test")
		assert.Error(t, err, "Expected an error for server error response")
		assert.Empty(t, response, "Response should be empty on error")
	})
	
	t.Run("CreateType_Success_Simple", func(t *testing.T) {
		// Reset WireMock
		err := wiremockClient.Reset()
		require.NoError(t, err)
		
		// Prepare test data
		requestType := &fern.Type{
			BasicType: fern.BasicTypePrimitive,
		}
		
		responseIdentifier := &fern.Identifier{
			Type:  requestType,
			Value: "test-value",
			Label: "Test Type",
		}
		
		responseBody, err := json.Marshal(responseIdentifier)
		require.NoError(t, err)
		
		// Create stub that matches JSON requests with BasicType field
		stub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.MatchingJsonPath("$.BasicType")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(string(responseBody)),
			)
		
		err = wiremockClient.StubFor(stub)
		require.NoError(t, err)
		
		// Test CreateType
		result, err := client.CreateType(context.Background(), requestType)
		require.NoError(t, err)
		require.NotNil(t, result)
		assert.Equal(t, "test-value", result.GetValue())
		assert.Equal(t, "Test Type", result.GetLabel())
		
		// Verify the request was made
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult)
	})
	
	t.Run("Echo_WithScenario_Simple", func(t *testing.T) {
		// Reset WireMock
		err := wiremockClient.Reset()
		require.NoError(t, err)
		
		// First stub - initial request
		firstStub := wiremock.Post(wiremock.URLEqualTo("/")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"First response"`),
			).
			InScenario("TestScenario").
			WhenScenarioStateIs(wiremock.ScenarioStateStarted).
			WillSetStateTo("FirstComplete")
		
		err = wiremockClient.StubFor(firstStub)
		require.NoError(t, err)
		
		// Second stub - subsequent request
		secondStub := wiremock.Post(wiremock.URLEqualTo("/")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Second response"`),
			).
			InScenario("TestScenario").
			WhenScenarioStateIs("FirstComplete")
		
		err = wiremockClient.StubFor(secondStub)
		require.NoError(t, err)
		
		// Make first request
		response1, err := client.Echo(context.Background(), "first")
		require.NoError(t, err)
		assert.Equal(t, "First response", response1)
		
		// Make second request
		response2, err := client.Echo(context.Background(), "second")
		require.NoError(t, err)
		assert.Equal(t, "Second response", response2)
	})
}

// TestWireMockHelpers demonstrates basic helper functions for WireMock testing
func TestWireMockHelpers(t *testing.T) {
	wiremockClient := wiremock.NewClient("http://localhost:8080")
	
	// Helper function to reset and create client
	setupTest := func(t *testing.T) *Client {
		err := wiremockClient.Reset()
		require.NoError(t, err, "Failed to reset WireMock")
		
		return NewClient(option.WithBaseURL("http://localhost:8080"))
	}
	
	// Helper function to create echo stub
	createEchoStub := func(input, output string) *wiremock.StubRule {
		return wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.EqualTo(`"`+input+`"`)).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"`+output+`"`),
			)
	}
	
	t.Run("Echo_WithHelper", func(t *testing.T) {
		client := setupTest(t)
		
		// Create and register stub
		stub := createEchoStub("helper test", "helper response")
		err := wiremockClient.StubFor(stub)
		require.NoError(t, err)
		
		// Test
		response, err := client.Echo(context.Background(), "helper test")
		require.NoError(t, err)
		assert.Equal(t, "helper response", response)
		
		// Verify
		verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
		require.NoError(t, err)
		assert.True(t, verifyResult)
	})
	
	t.Run("Echo_WithPriorities", func(t *testing.T) {
		client := setupTest(t)
		
		// High priority stub for specific content
		specificStub := wiremock.Post(wiremock.URLEqualTo("/")).
			WithBodyPattern(wiremock.Matching(".*special.*")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Special response"`),
			).
			AtPriority(1) // High priority
		
		err := wiremockClient.StubFor(specificStub)
		require.NoError(t, err)
		
		// Lower priority catch-all stub
		catchAllStub := wiremock.Post(wiremock.URLEqualTo("/")).
			WillReturnResponse(
				wiremock.NewResponse().
					WithStatus(http.StatusOK).
					WithHeader("Content-Type", "application/json").
					WithBody(`"Default response"`),
			).
			AtPriority(10) // Lower priority
		
		err = wiremockClient.StubFor(catchAllStub)
		require.NoError(t, err)
		
		// Test specific match
		response1, err := client.Echo(context.Background(), "This is special content")
		require.NoError(t, err)
		assert.Equal(t, "Special response", response1)
		
		// Test default match
		response2, err := client.Echo(context.Background(), "Regular content")
		require.NoError(t, err)
		assert.Equal(t, "Default response", response2)
	})
}
