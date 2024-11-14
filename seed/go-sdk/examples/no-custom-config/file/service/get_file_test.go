package service

import (
	context "context"
	"net/http"
	testing "testing"

	fern "github.com/examples/fern"
	file "github.com/examples/fern/file"
	mockwire "github.com/examples/fern/mockwire"
	option "github.com/examples/fern/option"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetFile(t *testing.T) {
	tests := []struct {
		desc      string
		request   *mockwire.Request
		response  *mockwire.Response
		wantError string
	}{
		{
			desc: "get file succeded",
			request: &mockwire.Request{
				URL:    "/file/{filename}",
				Method: http.MethodPost,
				Headers: map[string]string{
					"X-File-API-Version": "0.0.2",
				},
				BodyProperties:  nil,
				QueryParameters: nil,
				PathParameters: map[string]string{
					"filename": "file.txt",
				},
				Auth:  false,
				Token: "",
			},
			response: &mockwire.Response{
				Body: map[string]interface{}{
					"file": &fern.File{
						Name:     "name",
						Contents: "contents",
					},
				},
				Status: http.StatusOK,
			},
			wantError: "",
		},
		{
			desc: "get file with error",
			request: &mockwire.Request{
				URL:    "/file/{filename}",
				Method: http.MethodPost,
				Headers: map[string]string{
					"X-File-API-Version": "0.0.2",
				},
				BodyProperties:  nil,
				QueryParameters: nil,
				PathParameters: map[string]string{
					"filename": "file.txt",
				},
				Auth:  false,
				Token: "",
			},
			response: &mockwire.Response{
				Body:   nil,
				Status: http.StatusOK,
			},
			wantError: "an error should be returned",
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

			response, err := client.GetFile(
				context.TODO(),
				tt.request.PathParameters["filename"],
				&file.GetFileRequest{
					XFileApiVersion: tt.request.Headers["XFileApiVersion"],
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
