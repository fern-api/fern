package core

import (
	"sync"
	"time"
)

const (
	// expirationBufferMinutes is subtracted from the token expiration time
	// to ensure we refresh the token before it actually expires.
	expirationBufferMinutes = 2

	// DefaultExpirySeconds is used when the auth response doesn't include an expires_in value.
	DefaultExpirySeconds = 3600 // 1 hour fallback
)

// InferredAuthProvider manages authentication tokens with caching and automatic refresh.
type InferredAuthProvider struct {
	mu          sync.Mutex
	accessToken string
	expiresAt   time.Time

	// fetchMu ensures only one goroutine fetches a new token at a time
	fetchMu sync.Mutex
}

// NewInferredAuthProvider creates a new InferredAuthProvider.
func NewInferredAuthProvider() *InferredAuthProvider {
	return &InferredAuthProvider{}
}

// SetToken sets the cached access token and its expiration time.
// The expiresIn parameter is the number of seconds until the token expires.
func (i *InferredAuthProvider) SetToken(accessToken string, expiresIn int) {
	i.mu.Lock()
	defer i.mu.Unlock()
	i.accessToken = accessToken
	if expiresIn > 0 {
		// Apply buffer to refresh before actual expiration
		bufferSeconds := expirationBufferMinutes * 60
		effectiveExpiresIn := expiresIn - bufferSeconds
		if effectiveExpiresIn < 0 {
			effectiveExpiresIn = 0
		}
		i.expiresAt = time.Now().Add(time.Duration(effectiveExpiresIn) * time.Second)
	} else {
		// Use default expiry with buffer when no expiration info is provided
		effectiveExpiresIn := DefaultExpirySeconds - (expirationBufferMinutes * 60)
		if effectiveExpiresIn < 0 {
			effectiveExpiresIn = 0
		}
		i.expiresAt = time.Now().Add(time.Duration(effectiveExpiresIn) * time.Second)
	}
}

// GetToken returns the cached access token if it's still valid.
// Returns an empty string if the token is expired or not set.
func (i *InferredAuthProvider) GetToken() string {
	i.mu.Lock()
	defer i.mu.Unlock()
	if i.accessToken == "" {
		return ""
	}
	if !i.expiresAt.IsZero() && time.Now().After(i.expiresAt) {
		return ""
	}
	return i.accessToken
}

// GetOrFetch returns a valid token, fetching a new one if necessary.
// The fetchFunc is called at most once even if multiple goroutines call GetOrFetch
// concurrently when the token is expired. It should return (accessToken, expiresInSeconds, error).
func (i *InferredAuthProvider) GetOrFetch(fetchFunc func() (string, int, error)) (string, error) {
	// Fast path: check if we have a valid token
	if token := i.GetToken(); token != "" {
		return token, nil
	}

	// Slow path: acquire fetch lock to ensure only one goroutine fetches
	i.fetchMu.Lock()
	defer i.fetchMu.Unlock()

	// Double-check after acquiring lock (another goroutine may have fetched)
	if token := i.GetToken(); token != "" {
		return token, nil
	}

	// Fetch new token
	accessToken, expiresIn, err := fetchFunc()
	if err != nil {
		return "", err
	}

	i.SetToken(accessToken, expiresIn)
	return accessToken, nil
}

// NeedsRefresh returns true if the token needs to be refreshed.
func (i *InferredAuthProvider) NeedsRefresh() bool {
	i.mu.Lock()
	defer i.mu.Unlock()
	if i.accessToken == "" {
		return true
	}
	if !i.expiresAt.IsZero() && time.Now().After(i.expiresAt) {
		return true
	}
	return false
}

// Reset clears the cached token.
func (i *InferredAuthProvider) Reset() {
	i.mu.Lock()
	defer i.mu.Unlock()
	i.accessToken = ""
	i.expiresAt = time.Time{}
}
