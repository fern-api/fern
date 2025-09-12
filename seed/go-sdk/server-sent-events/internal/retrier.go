package internal

import (
	"crypto/rand"
	"math/big"
	"net/http"
	"strconv"
	"time"
)

const (
	defaultRetryAttempts = 2
	minRetryDelay        = 500 * time.Millisecond
	maxRetryDelay        = 5000 * time.Millisecond
)

// RetryOption adapts the behavior the *Retrier.
type RetryOption func(*retryOptions)

// RetryFunc is a retryable HTTP function call (i.e. *http.Client.Do).
type RetryFunc func(*http.Request) (*http.Response, error)

// WithMaxAttempts configures the maximum number of attempts
// of the *Retrier.
func WithMaxAttempts(attempts uint) RetryOption {
	return func(opts *retryOptions) {
		opts.attempts = attempts
	}
}

// Retrier retries failed requests a configurable number of times with an
// exponential back-off between each retry.
type Retrier struct {
	attempts uint
}

// NewRetrier constructs a new *Retrier with the given options, if any.
func NewRetrier(opts ...RetryOption) *Retrier {
	options := new(retryOptions)
	for _, opt := range opts {
		opt(options)
	}
	attempts := uint(defaultRetryAttempts)
	if options.attempts > 0 {
		attempts = options.attempts
	}
	return &Retrier{
		attempts: attempts,
	}
}

// Run issues the request and, upon failure, retries the request if possible.
//
// The request will be retried as long as the request is deemed retryable and the
// number of retry attempts has not grown larger than the configured retry limit.
func (r *Retrier) Run(
	fn RetryFunc,
	request *http.Request,
	errorDecoder ErrorDecoder,
	opts ...RetryOption,
) (*http.Response, error) {
	options := new(retryOptions)
	for _, opt := range opts {
		opt(options)
	}
	maxRetryAttempts := r.attempts
	if options.attempts > 0 {
		maxRetryAttempts = options.attempts
	}
	var (
		retryAttempt  uint
		previousError error
	)
	return r.run(
		fn,
		request,
		errorDecoder,
		maxRetryAttempts,
		retryAttempt,
		previousError,
	)
}

func (r *Retrier) run(
	fn RetryFunc,
	request *http.Request,
	errorDecoder ErrorDecoder,
	maxRetryAttempts uint,
	retryAttempt uint,
	previousError error,
) (*http.Response, error) {
	if retryAttempt >= maxRetryAttempts {
		return nil, previousError
	}

	// If the call has been cancelled, don't issue the request.
	if err := request.Context().Err(); err != nil {
		return nil, err
	}

	response, err := fn(request)
	if err != nil {
		return nil, err
	}

	if r.shouldRetry(response) {
		defer response.Body.Close()

		delay, err := r.retryDelay(response, retryAttempt)
		if err != nil {
			return nil, err
		}

		time.Sleep(delay)

		return r.run(
			fn,
			request,
			errorDecoder,
			maxRetryAttempts,
			retryAttempt + 1,
			decodeError(response, errorDecoder),
		)
	}

	return response, nil
}

// shouldRetry returns true if the request should be retried based on the given
// response status code.
func (r *Retrier) shouldRetry(response *http.Response) bool {
	return response.StatusCode == http.StatusTooManyRequests ||
		response.StatusCode == http.StatusRequestTimeout ||
		response.StatusCode >= http.StatusInternalServerError
}

// retryDelay calculates the delay time based on response headers,
// falling back to exponential backoff if no headers are present.
func (r *Retrier) retryDelay(response *http.Response, retryAttempt uint) (time.Duration, error) {
	// Check for Retry-After header first (RFC 7231)
	if retryAfter := response.Header.Get("Retry-After"); retryAfter != "" {
		// Parse as number of seconds...
		if seconds, err := strconv.Atoi(retryAfter); err == nil {
			delay := time.Duration(seconds) * time.Second
			if delay > maxRetryDelay {
				delay = maxRetryDelay
			}
			return r.addJitter(delay)
		}

		// ...or as an HTTP date; both are valid
		if retryTime, err := time.Parse(time.RFC1123, retryAfter); err == nil {
			delay := time.Until(retryTime)
			if delay < 0 {
				delay = 0
			}
			if delay > maxRetryDelay {
				delay = maxRetryDelay
			}
			return r.addJitter(delay)
		}
	}

	// Then check for industry-standard X-RateLimit-Reset header
	if rateLimitReset := response.Header.Get("X-RateLimit-Reset"); rateLimitReset != "" {
		if resetTimestamp, err := strconv.ParseInt(rateLimitReset, 10, 64); err == nil {
			// Assume Unix timestamp in seconds
			resetTime := time.Unix(resetTimestamp, 0)
			delay := time.Until(resetTime)
			if delay > 0 {
				if delay > maxRetryDelay {
					delay = maxRetryDelay
				}
				return r.addJitter(delay)
			}
		}
	}

	// Fall back to exponential backoff
	return r.exponentialBackoffDelay(retryAttempt)
}

// exponentialBackoffDelay calculates the delay time in milliseconds based on the retry attempt.
func (r *Retrier) exponentialBackoffDelay(retryAttempt uint) (time.Duration, error) {
	// Apply exponential backoff.
	delay := minRetryDelay + minRetryDelay * time.Duration(retryAttempt * retryAttempt)
	if delay > maxRetryDelay {
		delay = maxRetryDelay
	}

	return r.addJitter(delay)
}

// addJitter applies jitter to the given delay by randomizing the value
// in the range of 75%-100%.
func (r *Retrier) addJitter(delay time.Duration) (time.Duration, error) {
	max := big.NewInt(int64(delay / 4))
	jitter, err := rand.Int(rand.Reader, max)
	if err != nil {
		return 0, err
	}

	delay -= time.Duration(jitter.Int64())
	if delay < minRetryDelay {
		delay = minRetryDelay
	}

	return delay, nil
}

type retryOptions struct {
	attempts uint
}
