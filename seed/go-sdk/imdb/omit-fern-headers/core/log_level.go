package core

import "strings"

// LogLevel represents the severity level for log messages.
// Silent by default — no log output unless explicitly configured.
type LogLevel int

const (
	// LogLevelDebug is the lowest log level, used for detailed debugging information.
	LogLevelDebug LogLevel = iota + 1
	// LogLevelInfo is used for general informational messages.
	LogLevelInfo
	// LogLevelWarn is used for warning messages that indicate potential issues.
	LogLevelWarn
	// LogLevelError is used for error messages that indicate serious problems.
	LogLevelError
)

// String returns the string representation of the log level.
func (l LogLevel) String() string {
	switch l {
	case LogLevelDebug:
		return "DEBUG"
	case LogLevelInfo:
		return "INFO"
	case LogLevelWarn:
		return "WARN"
	case LogLevelError:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

// ParseLogLevel parses a log level from a string (case-insensitive).
func ParseLogLevel(level string) LogLevel {
	switch strings.ToLower(level) {
	case "debug":
		return LogLevelDebug
	case "info":
		return LogLevelInfo
	case "warn":
		return LogLevelWarn
	case "error":
		return LogLevelError
	default:
		return LogLevelInfo
	}
}
