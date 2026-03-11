package core

import (
	"fmt"
	"io"
	"os"
	"sync"
)

// ConsoleLogger is the default logger implementation that writes to stderr.
// It uses a simple format of "LEVEL - message".
type ConsoleLogger struct {
	mu       sync.Mutex
	output   io.Writer
	minLevel LogLevel
}

// ConsoleLoggerOption configures a ConsoleLogger.
type ConsoleLoggerOption func(*ConsoleLogger)

// WithConsoleLoggerOutput sets the output writer for the console logger.
func WithConsoleLoggerOutput(output io.Writer) ConsoleLoggerOption {
	return func(l *ConsoleLogger) {
		l.output = output
	}
}

// WithConsoleLoggerLevel sets the minimum log level for the console logger.
func WithConsoleLoggerLevel(level LogLevel) ConsoleLoggerOption {
	return func(l *ConsoleLogger) {
		l.minLevel = level
	}
}

// NewConsoleLogger creates a new ConsoleLogger instance.
// By default, it writes to stderr with INFO level.
func NewConsoleLogger(opts ...ConsoleLoggerOption) *ConsoleLogger {
	logger := &ConsoleLogger{
		output:   os.Stderr,
		minLevel: LogLevelInfo,
	}
	for _, opt := range opts {
		opt(logger)
	}
	return logger
}

// Debug logs a debug message.
func (l *ConsoleLogger) Debug(msg string) {
	if l.minLevel <= LogLevelDebug {
		l.log("DEBUG", msg)
	}
}

// Info logs an informational message.
func (l *ConsoleLogger) Info(msg string) {
	if l.minLevel <= LogLevelInfo {
		l.log("INFO", msg)
	}
}

// Warn logs a warning message.
func (l *ConsoleLogger) Warn(msg string) {
	if l.minLevel <= LogLevelWarn {
		l.log("WARN", msg)
	}
}

// Error logs an error message.
func (l *ConsoleLogger) Error(msg string) {
	if l.minLevel <= LogLevelError {
		l.log("ERROR", msg)
	}
}

// IsDebug returns true if debug logging is enabled.
func (l *ConsoleLogger) IsDebug() bool {
	return l.minLevel <= LogLevelDebug
}

// IsInfo returns true if info logging is enabled.
func (l *ConsoleLogger) IsInfo() bool {
	return l.minLevel <= LogLevelInfo
}

// IsWarn returns true if warn logging is enabled.
func (l *ConsoleLogger) IsWarn() bool {
	return l.minLevel <= LogLevelWarn
}

// IsError returns true if error logging is enabled.
func (l *ConsoleLogger) IsError() bool {
	return l.minLevel <= LogLevelError
}

func (l *ConsoleLogger) log(level, msg string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	fmt.Fprintf(l.output, "%s - %s\n", level, msg)
}

// Ensure ConsoleLogger implements both Logger and LogLevelChecker interfaces.
var (
	_ Logger         = (*ConsoleLogger)(nil)
	_ LogLevelChecker = (*ConsoleLogger)(nil)
)
