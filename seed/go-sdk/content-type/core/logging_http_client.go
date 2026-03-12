package core

import (
	"fmt"
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
	logger *Logger
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
	// Log the request if debug is enabled
	if c.logger.IsDebug() {
		c.logRequest(req)
	}

	// Perform the request
	resp, err := c.client.Do(req)

	// Log the response if debug is enabled
	if c.logger.IsDebug() && resp != nil {
		c.logResponse(resp)
	}

	// Log errors if error logging is enabled
	if c.logger.IsError() && err != nil {
		c.logger.Error(fmt.Sprintf("HTTP Error: url=%s error=%v", req.URL, err))
	}

	// Log 4xx/5xx responses if error logging is enabled
	if c.logger.IsError() && resp != nil && resp.StatusCode >= 400 {
		c.logger.Error(fmt.Sprintf("HTTP Error: status=%d url=%s", resp.StatusCode, req.URL))
	}

	return resp, err
}

// logRequest logs the HTTP request details.
func (c *LoggingHTTPClient) logRequest(req *http.Request) {
	var sb strings.Builder
	sb.WriteString("HTTP Request: ")
	sb.WriteString(req.Method)
	sb.WriteString(" ")
	sb.WriteString(req.URL.String())
	sb.WriteString(" headers={")

	// Sort header names for consistent output
	headerNames := make([]string, 0, len(req.Header))
	for name := range req.Header {
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
			sb.WriteString(strings.Join(req.Header.Values(name), ";"))
		}
	}

	sb.WriteString("}")
	sb.WriteString(" has_body=")
	fmt.Fprintf(&sb, "%v", req.Body != nil)

	c.logger.Debug(sb.String())
}

// logResponse logs the HTTP response details.
func (c *LoggingHTTPClient) logResponse(resp *http.Response) {
	var sb strings.Builder
	sb.WriteString("HTTP Response: status=")
	fmt.Fprintf(&sb, "%d", resp.StatusCode)
	sb.WriteString(" url=")
	sb.WriteString(resp.Request.URL.String())
	sb.WriteString(" headers={")

	// Sort header names for consistent output
	headerNames := make([]string, 0, len(resp.Header))
	for name := range resp.Header {
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
			sb.WriteString(strings.Join(resp.Header.Values(name), ";"))
		}
	}

	sb.WriteString("}")

	c.logger.Debug(sb.String())
}

// Ensure LoggingHTTPClient implements HTTPClient interface.
var _ HTTPClient = (*LoggingHTTPClient)(nil)
