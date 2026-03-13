package core

// ILogger is the interface for logging SDK operations.
// Implement this interface to provide custom logging backend.
type ILogger interface {
	// Debug logs a debug message.
	Debug(msg string)
	// Info logs an informational message.
	Info(msg string)
	// Warn logs a warning message.
	Warn(msg string)
	// Error logs an error message.
	Error(msg string)
}

// Logger is a wrapper around ILogger that provides level-based logging.
type Logger struct {
	logger ILogger
	level  LogLevel
	silent bool
}

// NewLogger creates a new Logger wrapper.
func NewLogger(logger ILogger, level LogLevel, silent bool) *Logger {
	return &Logger{
		logger: logger,
		level:  level,
		silent: silent,
	}
}

// Debug logs a debug message if debug logging is enabled.
func (l *Logger) Debug(msg string) {
	if l.silent {
		return
	}
	if l.shouldLog(LogLevelDebug) {
		l.logger.Debug(msg)
	}
}

// Info logs an info message if info logging is enabled.
func (l *Logger) Info(msg string) {
	if l.silent {
		return
	}
	if l.shouldLog(LogLevelInfo) {
		l.logger.Info(msg)
	}
}

// Warn logs a warning message if warn logging is enabled.
func (l *Logger) Warn(msg string) {
	if l.silent {
		return
	}
	if l.shouldLog(LogLevelWarn) {
		l.logger.Warn(msg)
	}
}

// Error logs an error message if error logging is enabled.
func (l *Logger) Error(msg string) {
	if l.silent {
		return
	}
	if l.shouldLog(LogLevelError) {
		l.logger.Error(msg)
	}
}

// IsDebug returns true if debug logging is enabled.
func (l *Logger) IsDebug() bool {
	return !l.silent && l.shouldLog(LogLevelDebug)
}

// IsInfo returns true if info logging is enabled.
func (l *Logger) IsInfo() bool {
	return !l.silent && l.shouldLog(LogLevelInfo)
}

// IsWarn returns true if warn logging is enabled.
func (l *Logger) IsWarn() bool {
	return !l.silent && l.shouldLog(LogLevelWarn)
}

// IsError returns true if error logging is enabled.
func (l *Logger) IsError() bool {
	return !l.silent && l.shouldLog(LogLevelError)
}

// shouldLog checks if a message at the given level should be logged.
func (l *Logger) shouldLog(level LogLevel) bool {
	return level >= l.level
}

// Ensure Logger implements ILogger interface.
var _ ILogger = (*Logger)(nil)
