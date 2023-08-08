package client

import (
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewClient(t *testing.T) {
	t.Run("default", func(t *testing.T) {
		c := NewClient()
		assert.Empty(t, c.(*client).baseURL)
		assert.Equal(t, http.DefaultClient, c.(*client).httpClient)
	})

	t.Run("base url", func(t *testing.T) {
		c := NewClient(
			ClientWithBaseURL("test.co"),
		)
		assert.Equal(t, "test.co", c.(*client).baseURL)
		assert.Equal(t, http.DefaultClient, c.(*client).httpClient)
	})

	t.Run("http client", func(t *testing.T) {
		httpClient := &http.Client{
			Timeout: 5 * time.Second,
		}
		c := NewClient(
			ClientWithHTTPClient(httpClient),
		)
		assert.Empty(t, c.(*client).baseURL)
		assert.Equal(t, httpClient, c.(*client).httpClient)
	})

	t.Run("http header", func(t *testing.T) {
		header := make(http.Header)
		header.Set("X-API-Tenancy", "test")
		c := NewClient(
			ClientWithHTTPHeader(header),
		)
		assert.Empty(t, c.(*client).baseURL)
		assert.Equal(t, http.DefaultClient, c.(*client).httpClient)
		assert.Equal(t, "test", c.(*client).header.Get("X-API-Tenancy"))
	})
}
