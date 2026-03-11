package core

// Logger is the interface for logging SDK operations.
// Implement this interface to provide custom logging backend.
type Logger interface {
	// Debug logs a debug message.
	Debug(msg string)
	// Info logs an informational message.
	Info(msg string)
	// Warn logs a warning message.
	Warn(msg string)
	// Error logs an error message.
	Error(msg string)
}

// LogLevelChecker provides methods to check if a log level is enabled.
type LogLevelChecker interface {
	// IsDebug returns true if debug logging is enabled.
	IsDebug() bool
	// IsInfo returns true if info logging is enabled.
	IsInfo() bool
	// IsWarn returns true if warn logging is enabled.
	IsWarn() bool
	// IsError returns true if error logging is enabled.
	IsError() bool
}
