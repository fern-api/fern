# WireMock Integration Testing

This package includes comprehensive integration tests using [WireMock](https://pkg.go.dev/github.com/wiremock/go-wiremock) for testing the client package against mocked HTTP services.

## Setup

### Prerequisites

1. **WireMock Server**: You need a running WireMock server on `localhost:8080` (default). 

   You can start WireMock using Docker:
   ```bash
   docker run -it --rm -p 8080:8080 wiremock/wiremock:latest
   ```

2. **Dependencies**: The go-wiremock library is included as a dependency in `go.mod`.

## Test Files

### `simple_wiremock_test.go`
Contains practical WireMock integration tests demonstrating:
- **Basic HTTP mocking** for Echo and CreateType endpoints
- **Error handling** with different HTTP status codes  
- **Scenario-based testing** with stateful request/response sequences
- **Helper functions** for test setup and stub creation
- **Priority-based request matching** for complex scenarios

## Running Tests

### Start WireMock Server
```bash
# Using Docker (recommended)
docker run -it --rm -p 8080:8080 wiremock/wiremock:latest

# Or download and run standalone
java -jar wiremock-standalone-3.2.0.jar --port 8080
```

### Run the Tests
```bash
# Run all WireMock tests
go test -v ./client -run=".*WireMock.*"

# Run specific test suites
go test -v ./client -run="TestSimpleWireMockIntegration"
go test -v ./client -run="TestWireMockHelpers"

# Run a single test
go test -v ./client -run="TestSimpleWireMockIntegration/Echo_Success_Simple"
```

## Example Usage

### Basic Test Setup
```go
func TestMyFeature(t *testing.T) {
    wiremockClient := wiremock.NewClient("http://localhost:8080")
    client := NewClient(option.WithBaseURL("http://localhost:8080"))
    
    // Reset WireMock state
    err := wiremockClient.Reset()
    require.NoError(t, err)
    
    // Create a simple stub
    stub := wiremock.Post(wiremock.URLEqualTo("/")).
        WithBodyPattern(wiremock.EqualTo(`"input"`)).
        WillReturnResponse(
            wiremock.NewResponse().
                WithStatus(http.StatusOK).
                WithHeader("Content-Type", "application/json").
                WithBody(`"output"`),
        )
    
    err = wiremockClient.StubFor(stub)
    require.NoError(t, err)
    
    // Test your client
    response, err := client.Echo(context.Background(), "input")
    require.NoError(t, err)
    assert.Equal(t, "output", response)
    
    // Verify the request was made
    verifyResult, err := wiremockClient.Verify(stub.Request(), 1)
    require.NoError(t, err)
    assert.True(t, verifyResult)
}
```

### Scenario-Based Testing
```go
func TestScenarioWorkflow(t *testing.T) {
    wiremockClient := wiremock.NewClient("http://localhost:8080")
    client := NewClient(option.WithBaseURL("http://localhost:8080"))
    
    // Reset WireMock state
    err := wiremockClient.Reset()
    require.NoError(t, err)
    
    // First stub - initial request
    firstStub := wiremock.Post(wiremock.URLEqualTo("/")).
        WillReturnResponse(
            wiremock.NewResponse().
                WithStatus(http.StatusOK).
                WithHeader("Content-Type", "application/json").
                WithBody(`"Step 1 completed"`),
        ).
        InScenario("MultiStepWorkflow").
        WhenScenarioStateIs(wiremock.ScenarioStateStarted).
        WillSetStateTo("Step1Complete")
    
    err = wiremockClient.StubFor(firstStub)
    require.NoError(t, err)
    
    // Second stub - subsequent request
    secondStub := wiremock.Post(wiremock.URLEqualTo("/")).
        WillReturnResponse(
            wiremock.NewResponse().
                WithStatus(http.StatusOK).
                WithHeader("Content-Type", "application/json").
                WithBody(`"Step 2 completed"`),
        ).
        InScenario("MultiStepWorkflow").
        WhenScenarioStateIs("Step1Complete")
    
    err = wiremockClient.StubFor(secondStub)
    require.NoError(t, err)
    
    // Execute workflow
    response1, err := client.Echo(context.Background(), "step1")
    require.NoError(t, err)
    assert.Equal(t, "Step 1 completed", response1)
    
    response2, err := client.Echo(context.Background(), "step2")
    require.NoError(t, err)
    assert.Equal(t, "Step 2 completed", response2)
}
```

## Test Coverage

The WireMock tests cover:

### HTTP Methods & Endpoints
- ✅ POST `/` (Echo endpoint)
- ✅ POST `/` (CreateType endpoint)

### Response Types
- ✅ Success responses (200 OK)
- ✅ Client errors (400 Bad Request)
- ✅ Server errors (500 Internal Server Error)
- ✅ Rate limiting (429 Too Many Requests)

### Advanced Features
- ✅ Request body matching (exact, contains, regex, JSON path)
- ✅ Response delays and timeouts
- ✅ Network fault injection
- ✅ Stateful scenarios with state transitions
- ✅ Request verification and counting
- ✅ Priority-based stub matching

### Error Conditions
- ✅ Network connectivity issues
- ✅ Connection reset by peer
- ✅ Request timeouts
- ✅ Invalid request payloads
- ✅ Server-side validation errors

## Troubleshooting

### WireMock Server Not Running
```
Error: Failed to reset WireMock server: connection refused
```
**Solution**: Make sure WireMock server is running on `localhost:8080`

### Port Already in Use
```
Error: port 8080 already in use
```
**Solution**: 
1. Stop any existing WireMock instances
2. Or use a different port: `NewWireMockTestHelper(t, "http://localhost:9090")`

### Test Flakiness
If tests are flaky:
1. Increase timeout values in `wiremock_helpers_test.go`
2. Add `time.Sleep()` between requests in complex scenarios
3. Ensure proper cleanup with `helper.Reset()` between test cases

### Request Verification Failures
```
Error: Expected 1 requests, but verification failed
```
**Solution**: 
1. Check that the request body/headers match exactly
2. Verify the stub was created before making the request
3. Use `helper.Client.GetAllRequests()` to debug actual requests made

## Best Practices

1. **Always Reset**: Call `helper.Reset()` at the start of each test
2. **Clean Up**: Use `helper.CleanupStub()` or `helper.CleanupStubs()` after tests
3. **Verify Requests**: Always verify expected requests were made
4. **Use Timeouts**: Wrap long-running operations with `helper.RunWithTimeout()`
5. **Specific Matching**: Use precise request matching to avoid test interference
6. **Meaningful Assertions**: Test both success and error conditions

## Further Reading

- [WireMock Go Library Documentation](https://pkg.go.dev/github.com/wiremock/go-wiremock)
- [WireMock Official Documentation](http://wiremock.org/)
- [Go Testing Best Practices](https://golang.org/doc/tutorial/add-a-test)
