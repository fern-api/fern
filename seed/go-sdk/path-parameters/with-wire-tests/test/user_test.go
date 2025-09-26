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

func TestUserGetUserWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go
    defer WireMockClient.Reset()
    stub := gowiremock.Get(gowiremock.URLPathTemplate("/{tenant_id}/user/{user_id}")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
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
    _, invocationErr :=     client.User.GetUser(
            context.TODO(),
            "tenant_id",
            "user_id",
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

func TestUserCreateUserWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Post(gowiremock.URLPathTemplate("/{tenant_id}/user/")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
    ).WithBodyPattern(gowiremock.MatchesJsonSchema("{}", "V202012")).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{"name": "name", "tags": []interface{}{"tags", "tags",},},
        ).WithStatus(http.StatusOK),
    )
    err := WireMockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")

        client := client.NewClient(
            option.WithBaseURL(
                WireMockBaseURL,
            ),
        )
        request := &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        }
    _, invocationErr :=     client.User.CreateUser(
            context.TODO(),
            "tenant_id",
            request,
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

func TestUserUpdateUserWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Patch(gowiremock.URLPathTemplate("/{tenant_id}/user/{user_id}")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
    ).WithPathParam(
        "user_id",
        gowiremock.Matching("user_id"),
    ).WithBodyPattern(gowiremock.MatchesJsonSchema("{}", "V202012")).WillReturnResponse(
        gowiremock.NewResponse().WithJSONBody(
            map[string]interface{}{"name": "name", "tags": []interface{}{"tags", "tags",},},
        ).WithStatus(http.StatusOK),
    )
    err := WireMockClient.StubFor(stub)
    require.NoError(t, err, "Failed to create WireMock stub")

        client := client.NewClient(
            option.WithBaseURL(
                WireMockBaseURL,
            ),
        )
        request := &fern.UpdateUserRequest{
            Body: &fern.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        }
    _, invocationErr :=     client.User.UpdateUser(
            context.TODO(),
            "tenant_id",
            "user_id",
            request,
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

func TestUserSearchUsersWithWireMock(
    t *testing.T,
) {
    // wiremock client and server initialized in shared main_test.go 
    defer WireMockClient.Reset()
    stub := gowiremock.Get(gowiremock.URLPathTemplate("/{tenant_id}/user/{user_id}/search")).WithPathParam(
        "tenant_id",
        gowiremock.Matching("tenant_id"),
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
        request := &fern.SearchUsersRequest{
            Limit: fern.Int(
                1,
            ),
        }
    _, invocationErr :=     client.User.SearchUsers(
            context.TODO(),
            "tenant_id",
            "user_id",
            request,
        )

    require.NoError(t, invocationErr, "Client method call should succeed")
    ok, countErr := WireMockClient.Verify(stub.Request(), 1)
    require.NoError(t, countErr, "Failed to verify WireMock request was matched")
    require.True(t, ok, "WireMock request was not matched")
}

