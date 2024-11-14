package service

import (
	context "context"
	"net/http"
	testing "testing"

	fern "github.com/examples/fern"
	mockwire "github.com/examples/fern/mockwire"
	option "github.com/examples/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateMovie(t *testing.T) {
	tests := []struct {
		desc      string
		request   *mockwire.Request
		response  *mockwire.Response
		wantError string
	}{
		{
			desc: "create movie succeded",
			request: &mockwire.Request{
				URL:     "/movie",
				Method:  http.MethodPost,
				Headers: nil,
				BodyProperties: map[string]interface{}{
					"id":      "movie-c06a4ad7",
					"prequel": "movie-cv9b914f",
					"title":   "The Boy and the Heron",
					"rating":  8,
					"tag":     "tag-wf9as23d",
					"metadata": map[string]interface{}{
						"actors": []interface{}{
							"Christian Bale",
							"Florence Pugh",
							"Willem Dafoe",
						},
						"releaseDate": "2023-12-08",
						"ratings": map[string]interface{}{
							"rottenTomatoes": 97,
							"imdb":           7.6,
						},
					},
					"revenue": 1000000,
				},
				QueryParameters: nil,
				PathParameters:  nil,
				Auth:            false,
				Token:           "",
			},
			response: &mockwire.Response{
				Body: map[string]interface{}{
					"id": "movie-c06a4ad7",
				},
				Status: http.StatusOK,
			},
			wantError: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			stub, err := mockwire.Run(&mockwire.TestCase{
				Request:  tt.request,
				Response: tt.response,
			})
			require.NoError(t, err)
			defer stub.Shutdown()

			client := NewClient(
				// option.WithToken(
				// 	tt.request.Token,
				// ),
				option.WithBaseURL(stub.URL),
			)

			response, err := client.CreateMovie(
				context.TODO(),
				&fern.Movie{
					Id: "movie-c06a4ad7",
					Prequel: fern.String(
						"movie-cv9b914f",
					),
					Title:  "The Boy and the Heron",
					From:   "Hayao Miyazaki",
					Rating: 8,
					Tag:    "tag-wf9as23d",
					Metadata: map[string]interface{}{
						"actors": []interface{}{
							"Christian Bale",
							"Florence Pugh",
							"Willem Dafoe",
						},
						"releaseDate": "2023-12-08",
						"ratings": map[string]interface{}{
							"rottenTomatoes": 97,
							"imdb":           7.6,
						},
					},
					Revenue: 1000000,
				},
			)

			if tt.wantError != "" {
				assert.EqualError(t, err, tt.wantError)
				return
			}
			require.NoError(t, err)

			assert.Equal(t, tt.response.Body, response)
		})
	}
}
