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

func TestGetException(t *testing.T) {
	tests := []struct {
		desc      string
		request   *mockwire.Request
		response  *mockwire.Response
		wantError string
	}{
		{
			desc: "get exception succeded",
			request: &mockwire.Request{
				URL:             "/file/notification/{notificationId}",
				Method:          http.MethodGet,
				Headers:         nil,
				BodyProperties:  nil,
				QueryParameters: nil,
				PathParameters: map[string]string{
					"notificationId": "notification-hsy129x",
				},
				Auth:  true,
				Token: "a-token",
			},
			response: &mockwire.Response{
				Body: &fern.Exception{
					Type:    "test",
					Generic: &fern.ExceptionInfo{},
					Timeout: nil,
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
				option.WithToken(
					tt.request.Token,
				),
				option.WithBaseURL(stub.URL),
			)

			response, err := client.GetException(
				context.TODO(),
				tt.request.PathParameters["notificationId"],
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
