package core

import (
	"context"
	"sync"
	"time"
)

const (
	// expirationBufferMinutes is subtracted from the token expiration time
	// to ensure we refresh the token before it actually expires.
	expirationBufferMinutes = 2
)

// OAuthTokenResponse represents the response from an OAuth token endpoint.
type OAuthTokenResponse struct {
	AccessToken  string
	ExpiresIn    int
	RefreshToken string
}

// TokenFetcher is a function that fetches a new OAuth token.
type TokenFetcher func(ctx context.Context) (*OAuthTokenResponse, error)

// OAuthTokenProvider manages OAuth access tokens, including caching and automatic refresh.
type OAuthTokenProvider struct {
	tokenFetcher TokenFetcher

	mu           sync.Mutex
	accessToken  string
	refreshToken string
	expiresAt    time.Time
}

// NewOAuthTokenProvider creates a new OAuthTokenProvider with the given token fetcher.
func NewOAuthTokenProvider(tokenFetcher TokenFetcher) *OAuthTokenProvider {
	return &OAuthTokenProvider{
		tokenFetcher: tokenFetcher,
	}
}

// setToken sets the cached access token and its expiration time (must be called with lock held).
func (o *OAuthTokenProvider) setToken(accessToken string, expiresIn int, refreshToken string) {
	o.accessToken = accessToken
	if refreshToken != "" {
		o.refreshToken = refreshToken
	}
	if expiresIn > 0 {
		// Apply buffer to refresh before actual expiration
		bufferSeconds := expirationBufferMinutes * 60
		effectiveExpiresIn := expiresIn - bufferSeconds
		if effectiveExpiresIn < 0 {
			effectiveExpiresIn = 0
		}
		o.expiresAt = time.Now().Add(time.Duration(effectiveExpiresIn) * time.Second)
	} else {
		// No expiration info, token won't auto-refresh based on time
		o.expiresAt = time.Time{}
	}
}

// needsRefresh returns true if the token needs to be refreshed (must be called with lock held).
func (o *OAuthTokenProvider) needsRefresh() bool {
	if o.accessToken == "" {
		return true
	}
	if !o.expiresAt.IsZero() && time.Now().After(o.expiresAt) {
		return true
	}
	return false
}

// GetToken returns a valid access token, fetching a new one if necessary.
// If tokenOverride is non-empty, it will be returned directly without fetching.
func (o *OAuthTokenProvider) GetToken(ctx context.Context, tokenOverride string) (string, error) {
	if tokenOverride != "" {
		return tokenOverride, nil
	}

	o.mu.Lock()
	defer o.mu.Unlock()

	if !o.needsRefresh() {
		return o.accessToken, nil
	}

	// Fetch a new token
	resp, err := o.tokenFetcher(ctx)
	if err != nil {
		return "", err
	}

	o.setToken(resp.AccessToken, resp.ExpiresIn, resp.RefreshToken)
	return o.accessToken, nil
}

// Reset clears the cached token.
func (o *OAuthTokenProvider) Reset() {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.accessToken = ""
	o.refreshToken = ""
	o.expiresAt = time.Time{}
}
