package core

import (
	"context"
	"sync"
	"time"
)

const (
	// expiryBufferMinutes is the buffer time before token expiry to trigger a refresh.
	expiryBufferMinutes = 2
)

// OAuthTokenProvider manages OAuth tokens with automatic refresh.
type OAuthTokenProvider struct {
	clientID     string
	clientSecret string
	accessToken  string
	expiresAt    time.Time
	refreshFunc  func(ctx context.Context, clientID, clientSecret string) (*OAuthTokenResponse, error)
	mu           sync.Mutex
}

// OAuthTokenResponse represents the response from an OAuth token endpoint.
type OAuthTokenResponse struct {
	AccessToken string
	ExpiresIn   *int // seconds until expiry (optional)
}

// NewOAuthTokenProvider creates a new OAuthTokenProvider.
func NewOAuthTokenProvider(
	clientID string,
	clientSecret string,
	refreshFunc func(ctx context.Context, clientID, clientSecret string) (*OAuthTokenResponse, error),
) *OAuthTokenProvider {
	return &OAuthTokenProvider{
		clientID:     clientID,
		clientSecret: clientSecret,
		refreshFunc:  refreshFunc,
	}
}

// GetToken returns a valid access token, refreshing if necessary.
func (o *OAuthTokenProvider) GetToken(ctx context.Context) (string, error) {
	// Fast path: check if token is still valid without acquiring lock
	if o.accessToken != "" && (o.expiresAt.IsZero() || time.Now().Before(o.expiresAt)) {
		return o.accessToken, nil
	}

	o.mu.Lock()
	defer o.mu.Unlock()

	// Double-check after acquiring lock
	if o.accessToken != "" && (o.expiresAt.IsZero() || time.Now().Before(o.expiresAt)) {
		return o.accessToken, nil
	}

	return o.refresh(ctx)
}

// refresh fetches a new token from the OAuth endpoint.
func (o *OAuthTokenProvider) refresh(ctx context.Context) (string, error) {
	response, err := o.refreshFunc(ctx, o.clientID, o.clientSecret)
	if err != nil {
		return "", err
	}

	o.accessToken = response.AccessToken
	if response.ExpiresIn != nil {
		// Set expiry time with buffer
		o.expiresAt = time.Now().Add(time.Duration(*response.ExpiresIn)*time.Second - expiryBufferMinutes*time.Minute)
	} else {
		// No expiry info, token is valid indefinitely
		o.expiresAt = time.Time{}
	}

	return o.accessToken, nil
}
