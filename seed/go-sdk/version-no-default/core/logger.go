package core

// Logger is the interface that callers implement to provide
// custom logging to the SDK. The args parameter accepts key-value
// pairs compatible with popular Go logging libraries (slog, zap, zerolog).
type Logger interface {
	Log(level LogLevel, msg string, args ...any)
}

// LoggerFunc adapts a plain function into a Logger.
type LoggerFunc func(level LogLevel, msg string, args ...any)

func (f LoggerFunc) Log(level LogLevel, msg string, args ...any) { f(level, msg, args...) }

// leveledLogger wraps a Logger with level filtering and silent mode.
// All level-based filtering is handled here, not in the Logger implementation.
type leveledLogger struct {
	logger Logger
	level  LogLevel
	silent bool
}

// newLeveledLogger creates a new leveledLogger wrapper.
func newLeveledLogger(logger Logger, level LogLevel, silent bool) *leveledLogger {
	return &leveledLogger{
		logger: logger,
		level:  level,
		silent: silent,
	}
}

// Log logs a message if the given level is enabled.
func (l *leveledLogger) Log(level LogLevel, msg string, args ...any) {
	if l.silent {
		return
	}
	if level >= l.level {
		l.logger.Log(level, msg, args...)
	}
}

// Enabled returns true if messages at the given level would be logged.
func (l *leveledLogger) Enabled(level LogLevel) bool {
	return !l.silent && level >= l.level
}
