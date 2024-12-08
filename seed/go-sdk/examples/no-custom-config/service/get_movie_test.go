package service

import (
	context "context"
	"net/http"
	testing "testing"

	mockwire "github.com/examples/fern/mockwire"
	option "github.com/examples/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetMovie(t *testing.T) {
	tests := []struct {
		desc      string
		request   *mockwire.Request
		response  *mockwire.Response
		wantError string
	}{
		{
			desc: "get movie succeded",
			request: &mockwire.Request{
				URL:             "/movie/{movieId}",
				Method:          http.MethodGet,
				Headers:         nil,
				BodyProperties:  nil,
				QueryParameters: nil,
				PathParameters: map[string]string{
					"movieId": "movie-c06a4ad7",
				},
				Auth:  false,
				Token: "",
			},
			response: &mockwire.Response{
				Body: map[string]interface{}{
					"id":     "movie-c06a4ad7",
					"rating": 8,
					"tag":    "tag-wf9as23d",
					"metadata": map[string]interface{}{
						"actors": []interface{}{
							"Christian Bale",
						},
						"releaseDate": "2023-12-08",
						"ratings": map[string]interface{}{
							"rottenTomatoes": 97,
							"imdb":           7.6,
						},
					},
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

			response, err := client.GetMovie(
				context.TODO(),
				tt.request.PathParameters["movieId"],
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
