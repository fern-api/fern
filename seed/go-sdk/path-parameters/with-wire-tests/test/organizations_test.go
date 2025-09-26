package wiremock

import (
	context "context"
	http "net/http"
	testing "testing"

	fern "github.com/path-parameters/fern"
	client "github.com/path-parameters/fern/client"
	option "github.com/path-parameters/fern/option"
	require "github.com/stretchr/testify/require"
	gowiremock "github.com/wiremock/go-wiremock"
)



func TestOrganizationsGetOrganizationWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Get(gowiremock.URLPathTemplate("/{tenant_id}/organizations/{organization_id}/")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
    ).WithPathParam(
        "organization_id",
        gowiremock.Matching("organization_id"),
    ).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{},
        ).WithStatus(http.StatusOK),
    )
    err := WireMockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")

        client := client.NewClient(
            option.WithBaseURL(
                WireMockBaseURL,
            ),
        )
    _, invocationErr :=     client.Organizations.GetOrganization(
            context.TODO(),
            "tenant_id",
            "organization_id",
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

func TestOrganizationsGetOrganizationUserWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Get(gowiremock.URLPathTemplate("/{tenant_id}/organizations/{organization_id}/users/{user_id}")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
    ).WithPathParam(
        "organization_id",
        gowiremock.Matching("organization_id"),
    ).WithPathParam(
        "user_id",
        gowiremock.Matching("user_id"),
    ).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{},
        ).WithStatus(http.StatusOK),
    )
    err := WireMockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")

        client := client.NewClient(
            option.WithBaseURL(
                WireMockBaseURL,
            ),
        )
    _, invocationErr :=     client.Organizations.GetOrganizationUser(
            context.TODO(),
            "tenant_id",
            "organization_id",
            "user_id",
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

func TestOrganizationsSearchOrganizationsWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Get(gowiremock.URLPathTemplate("/{tenant_id}/organizations/{organization_id}/search")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
    ).WithPathParam(
        "organization_id",
        gowiremock.Matching("organization_id"),
    ).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{},
        ).WithStatus(http.StatusOK),
    )
    err := WireMockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")

        client := client.NewClient(
            option.WithBaseURL(
                WireMockBaseURL,
            ),
        )
        request := &fern.SearchOrganizationsRequest{
            Limit: fern.Int(
                1,
            ),
        }
    _, invocationErr :=     client.Organizations.SearchOrganizations(
            context.TODO(),
            "tenant_id",
            "organization_id",
            request,
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

