package core

import (
	"log/slog"
	"os"
)

// newDefaultLogger creates the default Logger backed by slog,
// writing to stderr with a text handler.
func newDefaultLogger() Logger {
	return &slogLogger{
		logger: slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})),
	}
}

// slogLogger adapts slog.Logger to the Logger interface.
type slogLogger struct {
	logger *slog.Logger
}

func (l *slogLogger) Log(level LogLevel, msg string, args ...any) {
	switch level {
	case LogLevelDebug:
		l.logger.Debug(msg, args...)
	case LogLevelInfo:
		l.logger.Info(msg, args...)
	case LogLevelWarn:
		l.logger.Warn(msg, args...)
	case LogLevelError:
		l.logger.Error(msg, args...)
	}
}

// Ensure slogLogger implements Logger interface.
var _ Logger = (*slogLogger)(nil)
