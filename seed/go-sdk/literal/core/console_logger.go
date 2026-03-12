package core

import (
	"fmt"
	"io"
	"os"
	"sync"
)

// ConsoleLogger is the default ILogger implementation that writes to stderr.
// It uses a simple format of "LEVEL - message".
type ConsoleLogger struct {
	mu     sync.Mutex
	output io.Writer
}

// ConsoleLoggerOption configures a ConsoleLogger.
type ConsoleLoggerOption func(*ConsoleLogger)

// WithConsoleLoggerOutput sets the output writer for the console logger.
func WithConsoleLoggerOutput(output io.Writer) ConsoleLoggerOption {
	return func(l *ConsoleLogger) {
		l.output = output
	}
}

// NewConsoleLogger creates a new ConsoleLogger instance.
// By default, it writes to stderr.
func NewConsoleLogger(opts ...ConsoleLoggerOption) *ConsoleLogger {
	logger := &ConsoleLogger{
		output: os.Stderr,
	}
	for _, opt := range opts {
		opt(logger)
	}
	return logger
}

// Debug logs a debug message.
func (l *ConsoleLogger) Debug(msg string) {
	l.log("DEBUG", msg)
}

// Info logs an informational message.
func (l *ConsoleLogger) Info(msg string) {
	l.log("INFO", msg)
}

// Warn logs a warning message.
func (l *ConsoleLogger) Warn(msg string) {
	l.log("WARN", msg)
}

// Error logs an error message.
func (l *ConsoleLogger) Error(msg string) {
	l.log("ERROR", msg)
}

func (l *ConsoleLogger) log(level, msg string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	_, _ = fmt.Fprintf(l.output, "%s - %s\n", level, msg)
}

// Ensure ConsoleLogger implements ILogger interface.
var _ ILogger = (*ConsoleLogger)(nil)
