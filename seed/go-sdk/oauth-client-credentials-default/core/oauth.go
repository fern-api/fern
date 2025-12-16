package core

import (
	"sync"
	"time"
)

const (
	// expirationBufferMinutes is subtracted from the token expiration time
	// to ensure we refresh the token before it actually expires.
	expirationBufferMinutes = 2

	// DefaultExpirySeconds is used when the OAuth response doesn't include an expires_in value.
	DefaultExpirySeconds = 3600 // 1 hour fallback
)

// OAuthTokenProvider manages OAuth access tokens, including caching and automatic refresh.
type OAuthTokenProvider struct {
	clientID     string
	clientSecret string

	mu          sync.Mutex
	accessToken string
	expiresAt   time.Time

	// fetchMu ensures only one goroutine fetches a new token at a time
	fetchMu sync.Mutex
}

// NewOAuthTokenProvider creates a new OAuthTokenProvider with the given credentials.
func NewOAuthTokenProvider(clientID string, clientSecret string) *OAuthTokenProvider {
	return &OAuthTokenProvider{
		clientID:     clientID,
		clientSecret: clientSecret,
	}
}

// ClientID returns the client ID.
func (o *OAuthTokenProvider) ClientID() string {
	return o.clientID
}

// ClientSecret returns the client secret.
func (o *OAuthTokenProvider) ClientSecret() string {
	return o.clientSecret
}

// SetToken sets the cached access token and its expiration time.
// The expiresIn parameter is the number of seconds until the token expires.
func (o *OAuthTokenProvider) SetToken(accessToken string, expiresIn int) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.accessToken = accessToken
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

// GetToken returns the cached access token if it's still valid.
// Returns an empty string if the token is expired or not set.
func (o *OAuthTokenProvider) GetToken() string {
	o.mu.Lock()
	defer o.mu.Unlock()
	if o.accessToken == "" {
		return ""
	}
	if !o.expiresAt.IsZero() && time.Now().After(o.expiresAt) {
		return ""
	}
	return o.accessToken
}

// GetOrFetch returns a valid token, fetching a new one if necessary.
// The fetchFunc is called at most once even if multiple goroutines call GetOrFetch
// concurrently when the token is expired. It should return (accessToken, expiresInSeconds, error).
func (o *OAuthTokenProvider) GetOrFetch(fetchFunc func() (string, int, error)) (string, error) {
	// Fast path: check if we have a valid token
	if token := o.GetToken(); token != "" {
		return token, nil
	}

	// Slow path: acquire fetch lock to ensure only one goroutine fetches
	o.fetchMu.Lock()
	defer o.fetchMu.Unlock()

	// Double-check after acquiring lock (another goroutine may have fetched)
	if token := o.GetToken(); token != "" {
		return token, nil
	}

	// Fetch new token
	accessToken, expiresIn, err := fetchFunc()
	if err != nil {
		return "", err
	}

	o.SetToken(accessToken, expiresIn)
	return accessToken, nil
}

// NeedsRefresh returns true if the token needs to be refreshed.
func (o *OAuthTokenProvider) NeedsRefresh() bool {
	o.mu.Lock()
	defer o.mu.Unlock()
	if o.accessToken == "" {
		return true
	}
	if !o.expiresAt.IsZero() && time.Now().After(o.expiresAt) {
		return true
	}
	return false
}

// Reset clears the cached token.
func (o *OAuthTokenProvider) Reset() {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.accessToken = ""
	o.expiresAt = time.Time{}
}
