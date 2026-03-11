package core

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
)

// Sensitive headers that should be redacted in logs.
var sensitiveHeaders = map[string]bool{
	"authorization":     true,
	"www-authenticate":  true,
	"x-api-key":         true,
	"api-key":           true,
	"apikey":            true,
	"x-api-token":       true,
	"x-auth-token":      true,
	"auth-token":        true,
	"proxy-authenticate": true,
	"proxy-authorization": true,
	"cookie":            true,
	"set-cookie":        true,
	"x-csrf-token":      true,
	"x-xsrf-token":      true,
	"x-session-token":   true,
	"x-access-token":    true,
}

// LoggingTransport is an http.RoundTripper that logs HTTP requests and responses.
//
// Logs request method, URL, and headers (with sensitive values redacted) at debug level.
// Logs response status at debug level, and 4xx/5xx responses at error level.
// Does nothing if the logger is silent.
type LoggingTransport struct {
	transport http.RoundTripper
	logger    Logger
	config    *LogConfig
}

// NewLoggingTransport creates a new LoggingTransport that wraps the given transport.
func NewLoggingTransport(transport http.RoundTripper, config *LogConfig) *LoggingTransport {
	if transport == nil {
		transport = http.DefaultTransport
	}
	return &LoggingTransport{
		transport: transport,
		logger:    config.Logger(),
		config:    config,
	}
}

// RoundTrip implements the http.RoundTripper interface.
func (t *LoggingTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	// If logging is silent, skip logging and just delegate to the transport
	if t.config.Silent() {
		return t.transport.RoundTrip(req)
	}

	// Log the request if debug is enabled
	if t.shouldLog(LogLevelDebug) {
		t.logRequest(req)
	}

	// Perform the request
	resp, err := t.transport.RoundTrip(req)

	// Log the response if debug is enabled
	if t.shouldLog(LogLevelDebug) && resp != nil {
		t.logResponse(resp)
	}

	// Log errors if error logging is enabled
	if t.shouldLog(LogLevelError) && err != nil {
		t.logger.Error(fmt.Sprintf("HTTP Error: url=%s error=%v", req.URL, err))
	}

	// Log 4xx/5xx responses if error logging is enabled
	if t.shouldLog(LogLevelError) && resp != nil && resp.StatusCode >= 400 {
		t.logger.Error(fmt.Sprintf("HTTP Error: status=%d url=%s", resp.StatusCode, req.URL))
	}

	return resp, err
}

// shouldLog returns true if the given log level should be logged.
func (t *LoggingTransport) shouldLog(level LogLevel) bool {
	if t.config.Silent() {
		return false
	}
	if t.logger == nil {
		return false
	}
	if checker, ok := t.logger.(LogLevelChecker); ok {
		switch level {
		case LogLevelDebug:
			return checker.IsDebug()
		case LogLevelInfo:
			return checker.IsInfo()
		case LogLevelWarn:
			return checker.IsWarn()
		case LogLevelError:
			return checker.IsError()
		}
	}
	// If logger doesn't implement LogLevelChecker, check the level directly
	return level >= t.config.Level()
}

// logRequest logs the HTTP request details.
func (t *LoggingTransport) logRequest(req *http.Request) {
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
	sb.WriteString(fmt.Sprintf("%v", req.Body != nil))

	t.logger.Debug(sb.String())
}

// logResponse logs the HTTP response details.
func (t *LoggingTransport) logResponse(resp *http.Response) {
	var sb strings.Builder
	sb.WriteString("HTTP Response: status=")
	sb.WriteString(fmt.Sprintf("%d", resp.StatusCode))
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

	t.logger.Debug(sb.String())
}

// Ensure LoggingTransport implements http.RoundTripper.
var _ http.RoundTripper = (*LoggingTransport)(nil)
