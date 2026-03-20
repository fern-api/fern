package core

import (
	"net/http"
	"sort"
	"strings"
)

// Sensitive headers that should be redacted in logs.
var sensitiveHeaders = map[string]bool{
	"authorization":       true,
	"www-authenticate":    true,
	"x-api-key":           true,
	"api-key":             true,
	"apikey":              true,
	"x-api-token":         true,
	"x-auth-token":        true,
	"auth-token":          true,
	"proxy-authenticate":  true,
	"proxy-authorization": true,
	"cookie":              true,
	"set-cookie":          true,
	"x-csrf-token":        true,
	"x-xsrf-token":        true,
	"x-session-token":     true,
	"x-access-token":      true,
}

// LoggingHTTPClient is an HTTPClient wrapper that logs HTTP requests and responses.
//
// Logs request method, URL, and headers (with sensitive values redacted) at debug level.
// Logs response status at debug level, and 4xx/5xx responses at error level.
// Does nothing if the logger is silent.
type LoggingHTTPClient struct {
	client HTTPClient
	logger *leveledLogger
}

// NewLoggingHTTPClient creates a new LoggingHTTPClient that wraps the given client.
func NewLoggingHTTPClient(client HTTPClient, config *LogConfig) HTTPClient {
	if client == nil {
		client = &http.Client{}
	}
	return &LoggingHTTPClient{
		client: client,
		logger: config.createLogger(),
	}
}

// Do implements the HTTPClient interface.
func (c *LoggingHTTPClient) Do(req *http.Request) (*http.Response, error) {
	if c.logger.Enabled(LogLevelDebug) {
		c.logRequest(req)
	}

	resp, err := c.client.Do(req)

	if c.logger.Enabled(LogLevelDebug) && resp != nil {
		c.logResponse(resp)
	}

	if c.logger.Enabled(LogLevelError) && err != nil {
		c.logger.Log(LogLevelError, "HTTP Error", "url", req.URL, "error", err)
	}

	if c.logger.Enabled(LogLevelError) && resp != nil && resp.StatusCode >= 400 {
		c.logger.Log(LogLevelError, "HTTP Error", "status", resp.StatusCode, "url", req.URL)
	}

	return resp, err
}

// logRequest logs the HTTP request details.
func (c *LoggingHTTPClient) logRequest(req *http.Request) {
	c.logger.Log(
		LogLevelDebug,
		"HTTP Request",
		"method", req.Method,
		"url", req.URL.String(),
		"headers", formatHeaders(req.Header),
		"has_body", req.Body != nil,
	)
}

// logResponse logs the HTTP response details.
func (c *LoggingHTTPClient) logResponse(resp *http.Response) {
	c.logger.Log(
		LogLevelDebug,
		"HTTP Response",
		"status", resp.StatusCode,
		"url", resp.Request.URL.String(),
		"headers", formatHeaders(resp.Header),
	)
}

// formatHeaders formats HTTP headers for logging, redacting sensitive values.
func formatHeaders(headers http.Header) string {
	var sb strings.Builder
	sb.WriteString("{")

	headerNames := make([]string, 0, len(headers))
	for name := range headers {
		headerNames = append(headerNames, name)
	}
	sort.Strings(headerNames)

	for i, name := range headerNames {
		if i > 0 {
			sb.WriteString(", ")
		}
		sb.WriteString(name)
		sb.WriteString("=")
		if sensitiveHeaders[strings.ToLower(name)] {
			sb.WriteString("[REDACTED]")
		} else {
			sb.WriteString(strings.Join(headers.Values(name), ";"))
		}
	}

	sb.WriteString("}")
	return sb.String()
}

// Ensure LoggingHTTPClient implements HTTPClient interface.
var _ HTTPClient = (*LoggingHTTPClient)(nil)
