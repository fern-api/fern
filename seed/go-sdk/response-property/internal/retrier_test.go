package internal

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/response-property/fern/core"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type RetryTestCase struct {
	description string

	giveAttempts    uint
	giveStatusCodes []int
	giveResponse    *InternalTestResponse

	wantResponse *InternalTestResponse
	wantError    *core.APIError
}

func TestRetrier(t *testing.T) {
	tests := []*RetryTestCase{
		{
			description:  "retry request succeeds after multiple failures",
			giveAttempts: 3,
			giveStatusCodes: []int{
				http.StatusServiceUnavailable,
				http.StatusServiceUnavailable,
				http.StatusOK,
			},
			giveResponse: &InternalTestResponse{
				Id: "1",
			},
			wantResponse: &InternalTestResponse{
				Id: "1",
			},
		},
		{
			description:  "retry request fails if MaxAttempts is exceeded",
			giveAttempts: 3,
			giveStatusCodes: []int{
				http.StatusRequestTimeout,
				http.StatusRequestTimeout,
				http.StatusRequestTimeout,
				http.StatusOK,
			},
			wantError: &core.APIError{
				StatusCode: http.StatusRequestTimeout,
			},
		},
		{
			description:  "retry durations increase exponentially and stay within the min and max delay values",
			giveAttempts: 4,
			giveStatusCodes: []int{
				http.StatusServiceUnavailable,
				http.StatusServiceUnavailable,
				http.StatusServiceUnavailable,
				http.StatusOK,
			},
		},
		{
			description:     "retry does not occur on status code 404",
			giveAttempts:    2,
			giveStatusCodes: []int{http.StatusNotFound, http.StatusOK},
			wantError: &core.APIError{
				StatusCode: http.StatusNotFound,
			},
		},
		{
			description:     "retries occur on status code 429",
			giveAttempts:    2,
			giveStatusCodes: []int{http.StatusTooManyRequests, http.StatusOK},
		},
		{
			description:     "retries occur on status code 408",
			giveAttempts:    2,
			giveStatusCodes: []int{http.StatusRequestTimeout, http.StatusOK},
		},
		{
			description:     "retries occur on status code 500",
			giveAttempts:    2,
			giveStatusCodes: []int{http.StatusInternalServerError, http.StatusOK},
		},
	}

	for _, tc := range tests {
		t.Run(tc.description, func(t *testing.T) {
			var (
				test   = tc
				server = newTestRetryServer(t, test)
				client = server.Client()
			)

			t.Parallel()

			caller := NewCaller(
				&CallerParams{
					Client: client,
				},
			)

			var response *InternalTestResponse
			_, err := caller.Call(
				context.Background(),
				&CallParams{
					URL:                server.URL,
					Method:             http.MethodGet,
					Request:            &InternalTestRequest{},
					Response:           &response,
					MaxAttempts:        test.giveAttempts,
					ResponseIsOptional: true,
				},
			)

			if test.wantError != nil {
				require.IsType(t, err, &core.APIError{})
				expectedErrorCode := test.wantError.StatusCode
				actualErrorCode := err.(*core.APIError).StatusCode
				assert.Equal(t, expectedErrorCode, actualErrorCode)
				return
			}

			require.NoError(t, err)
			assert.Equal(t, test.wantResponse, response)
		})
	}
}

func TestRetryExhaustionWithGzipErrorResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "gzip", r.Header.Get("Accept-Encoding"))
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(http.StatusInternalServerError)
		gzipWriter := gzip.NewWriter(w)
		_, err := gzipWriter.Write([]byte("retry failed"))
		require.NoError(t, err)
		require.NoError(t, gzipWriter.Close())
	}))
	defer server.Close()

	caller := NewCaller(&CallerParams{
		Client: server.Client(),
	})

	_, err := caller.Call(
		context.Background(),
		&CallParams{
			URL:    server.URL,
			Method: http.MethodGet,
			Headers: http.Header{
				"Accept-Encoding": []string{"gzip"},
			},
			MaxAttempts: 1,
		},
	)

	require.IsType(t, &core.APIError{}, err)
	require.EqualError(t, err, "500: retry failed")
}

// newTestRetryServer returns a new *httptest.Server configured with the
// given test parameters, suitable for testing retries.
func newTestRetryServer(t *testing.T, tc *RetryTestCase) *httptest.Server {
	var index int
	timestamps := make([]time.Time, 0, len(tc.giveStatusCodes))

	return httptest.NewServer(
		http.HandlerFunc(
			func(w http.ResponseWriter, r *http.Request) {
				timestamps = append(timestamps, time.Now())
				if index > 0 && index < len(expectedRetryDurations) {
					// Ensure that the duration between retries increases exponentially,
					// and that it is within the minimum and maximum retry delay values.
					actualDuration := timestamps[index].Sub(timestamps[index-1])
					expectedDurationMin := expectedRetryDurations[index-1] * 50 / 100
					expectedDurationMax := expectedRetryDurations[index-1] * 150 / 100
					assert.True(
						t,
						actualDuration >= expectedDurationMin && actualDuration <= expectedDurationMax,
						"expected duration to be in range [%v, %v], got %v",
						expectedDurationMin,
						expectedDurationMax,
						actualDuration,
					)
					assert.LessOrEqual(
						t,
						actualDuration,
						maxRetryDelay,
						"expected duration to be less than the maxRetryDelay (%v), got %v",
						maxRetryDelay,
						actualDuration,
					)
					assert.GreaterOrEqual(
						t,
						actualDuration,
						minRetryDelay,
						"expected duration to be greater than the minRetryDelay (%v), got %v",
						minRetryDelay,
						actualDuration,
					)
				}

				request := new(InternalTestRequest)
				bytes, err := io.ReadAll(r.Body)
				require.NoError(t, err)
				require.NoError(t, json.Unmarshal(bytes, request))
				require.LessOrEqual(t, index, len(tc.giveStatusCodes))

				statusCode := tc.giveStatusCodes[index]

				w.WriteHeader(statusCode)

				if tc.giveResponse != nil && statusCode == http.StatusOK {
					bytes, err = json.Marshal(tc.giveResponse)
					require.NoError(t, err)
					_, err = w.Write(bytes)
					require.NoError(t, err)
				}

				index++
			},
		),
	)
}

// expectedRetryDurations holds an array of calculated retry durations,
// where the index of the array should correspond to the retry attempt.
//
// Values are calculated based off of `minRetryDelay * 2^i`.
var expectedRetryDurations = []time.Duration{
	1000 * time.Millisecond, // 500ms * 2^1 = 1000ms
	2000 * time.Millisecond, // 500ms * 2^2 = 2000ms
	4000 * time.Millisecond, // 500ms * 2^3 = 4000ms
	8000 * time.Millisecond, // 500ms * 2^4 = 8000ms
}

func TestRetryWithRequestBody(t *testing.T) {
	// This test verifies that POST requests with a body are properly retried.
	// The request body should be re-sent on each retry attempt.
	expectedBody := `{"id":"test-id"}`
	var requestBodies []string
	var requestCount int

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestCount++
		bodyBytes, err := io.ReadAll(r.Body)
		require.NoError(t, err)
		requestBodies = append(requestBodies, string(bodyBytes))

		if requestCount == 1 {
			// First request - return retryable error
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		// Second request - return success
		w.WriteHeader(http.StatusOK)
		response := &InternalTestResponse{Id: "success"}
		bytes, _ := json.Marshal(response)
		_, _ = w.Write(bytes)
	}))
	defer server.Close()

	caller := NewCaller(&CallerParams{
		Client: server.Client(),
	})

	var response *InternalTestResponse
	_, err := caller.Call(
		context.Background(),
		&CallParams{
			URL:                server.URL,
			Method:             http.MethodPost,
			Request:            &InternalTestRequest{Id: "test-id"},
			Response:           &response,
			MaxAttempts:        2,
			ResponseIsOptional: true,
		},
	)

	require.NoError(t, err)
	require.Equal(t, 2, requestCount, "Expected exactly 2 requests")
	require.Len(t, requestBodies, 2, "Expected 2 request bodies to be captured")

	// Both requests should have the same non-empty body
	assert.Equal(t, expectedBody, requestBodies[0], "First request body should match expected")
	assert.Equal(t, expectedBody, requestBodies[1], "Second request body should match expected (retry should re-send body)")
}

func TestRetryWaitIsInterruptedByContext(t *testing.T) {
	var requestCount int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestCount++
		w.Header().Set("Retry-After", "5")
		w.WriteHeader(http.StatusTooManyRequests)
	}))
	defer server.Close()

	caller := NewCaller(&CallerParams{
		Client: server.Client(),
	})

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	start := time.Now()
	_, err := caller.Call(
		ctx,
		&CallParams{
			URL:         server.URL,
			Method:      http.MethodGet,
			Request:     &InternalTestRequest{},
			MaxAttempts: 3,
		},
	)
	elapsed := time.Since(start)

	assert.ErrorIs(t, err, context.DeadlineExceeded)
	assert.Equal(t, 1, requestCount, "Expected the retry to be abandoned once the context expired")
	assert.Less(t, elapsed, time.Second, "Expected the backoff to be interrupted by the context, took %v", elapsed)
}

func TestDisableRetries(t *testing.T) {
	tests := []struct {
		name             string
		clientParams     *CallerParams
		callParams       *CallParams
		wantRequestCount int
	}{
		{
			name:             "client-scoped DisableRetries",
			clientParams:     &CallerParams{DisableRetries: true},
			callParams:       &CallParams{},
			wantRequestCount: 1,
		},
		{
			name:             "request-scoped DisableRetries",
			clientParams:     &CallerParams{},
			callParams:       &CallParams{DisableRetries: true},
			wantRequestCount: 1,
		},
		{
			name:             "request-scoped MaxAttempts overrides client-scoped DisableRetries",
			clientParams:     &CallerParams{DisableRetries: true},
			callParams:       &CallParams{MaxAttempts: 3},
			wantRequestCount: 3,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			var requestCount int
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				requestCount++
				w.WriteHeader(http.StatusInternalServerError)
			}))
			defer server.Close()

			clientParams := *tt.clientParams
			clientParams.Client = server.Client()
			caller := NewCaller(&clientParams)

			callParams := *tt.callParams
			callParams.URL = server.URL
			callParams.Method = http.MethodGet
			callParams.Request = &InternalTestRequest{}

			_, err := caller.Call(context.Background(), &callParams)

			require.IsType(t, &core.APIError{}, err)
			assert.Equal(t, tt.wantRequestCount, requestCount)
		})
	}
}

// newCountingRetryFunc returns a RetryFunc that records the number of calls
// and serves the given status codes in order (repeating the last one).
func newCountingRetryFunc(count *int, header http.Header, statusCodes ...int) RetryFunc {
	return func(request *http.Request) (*http.Response, error) {
		index := *count
		if index >= len(statusCodes) {
			index = len(statusCodes) - 1
		}
		*count++
		return &http.Response{
			StatusCode: statusCodes[index],
			Header:     header.Clone(),
			Body:       io.NopCloser(strings.NewReader("")),
			Request:    request,
		}, nil
	}
}

// stubSleep replaces the retrier's sleep with one that records the requested
// delays instead of waiting, so tests can assert on backoff deterministically.
func stubSleep(retrier *Retrier) *[]time.Duration {
	var sleeps []time.Duration
	retrier.sleep = func(_ context.Context, delay time.Duration) error {
		sleeps = append(sleeps, delay)
		return nil
	}
	return &sleeps
}

func TestRetrierRunAttemptsAndSleeps(t *testing.T) {
	retryAfterOne := http.Header{"Retry-After": []string{"1"}}

	tests := []struct {
		name         string
		retrier      *Retrier
		runOptions   []RetryOption
		statusCodes  []int
		wantRequests int
		wantSleeps   []time.Duration
		wantResponse bool
	}{
		{
			name:         "constructor-level WithDisableRetries issues exactly one request without sleeping",
			retrier:      NewRetrier(WithDisableRetries()),
			statusCodes:  []int{http.StatusTooManyRequests},
			wantRequests: 1,
		},
		{
			name:         "constructor-level WithMaxAttempts(1) issues exactly one request without sleeping",
			retrier:      NewRetrier(WithMaxAttempts(1)),
			statusCodes:  []int{http.StatusTooManyRequests},
			wantRequests: 1,
		},
		{
			name:         "per-call WithDisableRetries overrides a retrying constructor without sleeping",
			retrier:      NewRetrier(WithMaxAttempts(3)),
			runOptions:   []RetryOption{WithDisableRetries()},
			statusCodes:  []int{http.StatusTooManyRequests},
			wantRequests: 1,
		},
		{
			name:         "two-attempt retrier against a persistent 429 sleeps exactly once",
			retrier:      NewRetrier(WithMaxAttempts(2)),
			statusCodes:  []int{http.StatusTooManyRequests},
			wantRequests: 2,
			wantSleeps:   []time.Duration{time.Second},
		},
		{
			name:         "retrier that succeeds on the second attempt returns the response",
			retrier:      NewRetrier(WithMaxAttempts(2)),
			statusCodes:  []int{http.StatusTooManyRequests, http.StatusOK},
			wantRequests: 2,
			wantSleeps:   []time.Duration{time.Second},
			wantResponse: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			request, err := http.NewRequestWithContext(context.Background(), http.MethodGet, "http://localhost", nil)
			require.NoError(t, err)

			var requestCount int
			fn := newCountingRetryFunc(&requestCount, retryAfterOne, tt.statusCodes...)
			sleeps := stubSleep(tt.retrier)

			response, err := tt.retrier.Run(fn, request, nil, tt.runOptions...)

			assert.Equal(t, tt.wantRequests, requestCount, "unexpected number of requests")
			assert.Equal(t, tt.wantSleeps, *sleeps, "unexpected backoff sleeps")
			if tt.wantResponse {
				require.NoError(t, err)
				require.NotNil(t, response)
				assert.Equal(t, http.StatusOK, response.StatusCode)
			} else {
				require.Error(t, err)
				assert.Nil(t, response)
			}
		})
	}
}

func TestRetryDelayDoesNotPanicOnTinyDelays(t *testing.T) {
	retrier := NewRetrier()

	for _, delay := range []time.Duration{0, 1 * time.Nanosecond, 4 * time.Nanosecond} {
		got, err := retrier.addPositiveJitter(delay)
		require.NoError(t, err)
		assert.Equal(t, minRetryDelay, got, "delay %v should be clamped to the minimum", delay)

		got, err = retrier.addSymmetricJitter(delay)
		require.NoError(t, err)
		assert.Equal(t, minRetryDelay, got, "delay %v should be clamped to the minimum", delay)
	}
}

func TestRetryDelayDoesNotPanicNearRateLimitReset(t *testing.T) {
	retrier := NewRetrier()
	resetTime := time.Now().Truncate(time.Second).Add(time.Second)
	response := &http.Response{
		StatusCode: http.StatusTooManyRequests,
		Header: http.Header{
			"X-Ratelimit-Reset": []string{fmt.Sprintf("%d", resetTime.Unix())},
		},
	}

	// Poll retryDelay right up to (and across) the reset instant so that the
	// X-RateLimit-Reset branch is exercised with sub-jitter (a few ns) delays.
	require.NotPanics(t, func() {
		for time.Until(resetTime) > -time.Millisecond {
			delay, err := retrier.retryDelay(response, 0)
			require.NoError(t, err)
			require.GreaterOrEqual(t, delay, minRetryDelay)
			require.LessOrEqual(t, delay, maxRetryDelay)
			time.Sleep(time.Millisecond)
		}
	})
}

func TestRetryDelayTiming(t *testing.T) {
	tests := []struct {
		name            string
		headerName      string
		headerValueFunc func() string
		expectedMinMs   int64
		expectedMaxMs   int64
	}{
		{
			name:       "retry-after with seconds value",
			headerName: "retry-after",
			headerValueFunc: func() string {
				return "1"
			},
			expectedMinMs: 500,
			expectedMaxMs: 1500,
		},
		{
			name:       "retry-after with HTTP date",
			headerName: "retry-after",
			headerValueFunc: func() string {
				return time.Now().Add(3 * time.Second).Format(time.RFC1123)
			},
			expectedMinMs: 1500,
			expectedMaxMs: 4500,
		},
		{
			name:       "x-ratelimit-reset with future timestamp",
			headerName: "x-ratelimit-reset",
			headerValueFunc: func() string {
				return fmt.Sprintf("%d", time.Now().Add(3*time.Second).Unix())
			},
			expectedMinMs: 1500,
			expectedMaxMs: 4500,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var timestamps []time.Time
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				timestamps = append(timestamps, time.Now())
				if len(timestamps) == 1 {
					// First request - return retryable error with header
					w.Header().Set(tt.headerName, tt.headerValueFunc())
					w.WriteHeader(http.StatusTooManyRequests)
				} else {
					// Second request - return success
					w.WriteHeader(http.StatusOK)
					response := &InternalTestResponse{Id: "success"}
					bytes, _ := json.Marshal(response)
					_, _ = w.Write(bytes)
				}
			}))
			defer server.Close()

			caller := NewCaller(&CallerParams{
				Client: server.Client(),
			})

			var response *InternalTestResponse
			_, err := caller.Call(
				context.Background(),
				&CallParams{
					URL:                server.URL,
					Method:             http.MethodGet,
					Request:            &InternalTestRequest{},
					Response:           &response,
					MaxAttempts:        2,
					ResponseIsOptional: true,
				},
			)

			require.NoError(t, err)
			require.Len(t, timestamps, 2, "Expected exactly 2 requests")

			actualDelayMs := timestamps[1].Sub(timestamps[0]).Milliseconds()

			assert.GreaterOrEqual(t, actualDelayMs, tt.expectedMinMs,
				"Actual delay %dms should be >= expected min %dms", actualDelayMs, tt.expectedMinMs)
			assert.LessOrEqual(t, actualDelayMs, tt.expectedMaxMs,
				"Actual delay %dms should be <= expected max %dms", actualDelayMs, tt.expectedMaxMs)
		})
	}
}
