package core

const (
	// expirationBufferMinutes is subtracted from the token expiration time
	// to ensure we refresh the token before it actually expires.
	expirationBufferMinutes = 2

	// DefaultExpirySeconds is used when the auth response doesn't include an expires_in value.
	DefaultExpirySeconds = 3600 // 1 hour fallback
)
