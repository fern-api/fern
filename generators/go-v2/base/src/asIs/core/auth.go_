package core

import (
	"context"
	"net/http"
)

// AuthProvider is an interface for providing authentication headers
// for HTTP requests. Implementations can handle token acquisition,
// caching, and refresh logic.
type AuthProvider interface {
	// AuthHeaders returns the authentication headers to be added to
	// the request. The context is used for any network calls needed
	// to acquire or refresh tokens.
	AuthHeaders(ctx context.Context) (http.Header, error)
}

// NoOpAuthProvider is an AuthProvider that returns no headers.
// It is used as a default when no authentication is configured.
type NoOpAuthProvider struct{}

// AuthHeaders returns an empty header map.
func (n *NoOpAuthProvider) AuthHeaders(ctx context.Context) (http.Header, error) {
	return http.Header{}, nil
}
