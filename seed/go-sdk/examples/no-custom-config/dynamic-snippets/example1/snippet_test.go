package example

import (
    testing "testing"
    context "context"
    wiremocktestcontainersgo "github.com/wiremock/wiremock-testcontainers-go"
    require "github.com/stretchr/testify/require"
    gowiremock "github.com/wiremock/go-wiremock"
    http "net/http"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func TestEchoWithWireMock(
    t *testing.T,
) {
    ctx := context.Background()
    container, containerErr := wiremocktestcontainersgo.RunContainerAndStopOnCleanup(
        ctx,
        t,
        wiremocktestcontainersgo.WithImage("docker.io/wiremock/wiremock:3.9.1"),
    )
    if containerErr != nil {
        t.Fatal(containerErr)
    }
    wireMockBaseURL, endpointErr := container.Endpoint(ctx, "")
    require.NoError(t, endpointErr, "Failed to get WireMock container endpoint")
    wiremockClient := container.Client
    defer wiremockClient.Reset()
    stub := gowiremock.Post(gowiremock.URLPathTemplate("/")).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{},
        ).WithStatus(http.StatusOK),
    )
    err := wiremockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")
    
    client := client.NewClient(
        option.WithBaseURL(
            "http://" + wireMockBaseURL,
        ),
    )
    _, invocationErr := client.Echo(
        context.TODO(),
        "string",
    )
    
    ok, countErr := wiremockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
    require.NoError(t, invocationErr, "Echo call should succeed with WireMock")
}
