package wiremock

import (
	context "context"
	fern "github.com/imdb/fern"
	client "github.com/imdb/fern/client"
	option "github.com/imdb/fern/option"
	require "github.com/stretchr/testify/require"
	gowiremock "github.com/wiremock/go-wiremock"
	http "net/http"
	testing "testing"
)

func TestImdbCreateMovieWithWireMock(
	t *testing.T,
) {
	// wiremock client and server initialized in shared main_test.go
	defer WireMockClient.Reset()
	stub := gowiremock.Post(gowiremock.URLPathTemplate("/movies/create-movie")).WithBodyPattern(gowiremock.MatchesJsonSchema("{}", "V202012")).WillReturnResponse(
		gowiremock.NewResponse().WithJSONBody(
			"string",
		).WithStatus(http.StatusOK),
	)
	err := WireMockClient.StubFor(stub)
	require.NoError(t, err, "Failed to create WireMock stub")

	client := client.NewClient(
		option.WithBaseURL(
			WireMockBaseURL,
		),
	)
	request := &fern.CreateMovieRequest{
		Title:  "title",
		Rating: 1.1,
	}
	_, invocationErr := client.Imdb.CreateMovie(
		context.TODO(),
		request,
	)

	require.NoError(t, invocationErr, "Client method call should succeed")
	ok, countErr := WireMockClient.Verify(stub.Request(), 1)
	require.NoError(t, countErr, "Failed to verify WireMock request was matched")
	require.True(t, ok, "WireMock request was not matched")
}

func TestImdbGetMovieWithWireMock(
	t *testing.T,
) {
	// wiremock client and server initialized in shared main_test.go
	defer WireMockClient.Reset()
	stub := gowiremock.Get(gowiremock.URLPathTemplate("/movies/{movieId}")).WithPathParam(
		"movieId",
		gowiremock.Matching("movieId"),
	).WillReturnResponse(
		gowiremock.NewResponse().WithJSONBody(
			map[string]interface{}{"id": "id", "title": "title", "rating": 1.1},
		).WithStatus(http.StatusOK),
	)
	err := WireMockClient.StubFor(stub)
	require.NoError(t, err, "Failed to create WireMock stub")

	client := client.NewClient(
		option.WithBaseURL(
			WireMockBaseURL,
		),
	)
	_, invocationErr := client.Imdb.GetMovie(
		context.TODO(),
		"movieId",
	)

	require.NoError(t, invocationErr, "Client method call should succeed")
	ok, countErr := WireMockClient.Verify(stub.Request(), 1)
	require.NoError(t, countErr, "Failed to verify WireMock request was matched")
	require.True(t, ok, "WireMock request was not matched")
}
