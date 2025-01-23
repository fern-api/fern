package imdb_test

import (
	context "context"
	"encoding/json"
	http "net/http"
	"testing"

	fern "github.com/imdb/fern"
	"github.com/imdb/fern/client"
	"github.com/imdb/fern/internal/wiretest"
	option "github.com/imdb/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestClient(t *testing.T) {
	testCases := []wiretest.TestCase{
		{
			Description: "POST /movies/create-movie (0)",
			Request: &wiretest.Request{
				Method: http.MethodPost,
				Path:   "/movies/create-movie",
				Body:   `{"title":"The Matrix","rating":8.7}`,
			},
			Response: &wiretest.Response{
				Body: "xyz",
			},
		},
	}
	for _, testCase := range testCases {
		t.Run(testCase.Description, func(t *testing.T) {
			server, cleanup := wiretest.NewServer(t, testCase)
			defer cleanup()

			client := client.NewClient(option.WithBaseURL(server.URL))
			response, err := client.Imdb.CreateMovie(
				context.Background(),
				&fern.CreateMovieRequest{
					Title:  "The Matrix",
					Rating: 8.7,
				},
			)
			require.NoError(t, err)

			bytes, err := json.Marshal(response)
			assert.Equal(t, testCase.Response.Body, string(bytes))
		})
	}
}
