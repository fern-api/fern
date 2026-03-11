package core

// LogConfig configures logging for the SDK.
// Use the builder to configure logging behavior.
//
// Example:
//
//	config := NewLogConfigBuilder().
//		Level(LogLevelDebug).
//		Silent(false).
//		Build()
//
// Or with a custom logger:
//
//	config := NewLogConfigBuilder().
//		Level(LogLevelDebug).
//		Logger(myCustomLogger).
//		Silent(false).
//		Build()
//
// Defaults:
//   - Level: LogLevelInfo
//   - Logger: ConsoleLogger (writes to stderr)
//   - Silent: true (no output unless explicitly enabled)
type LogConfig struct {
	level  LogLevel
	logger ILogger
	silent bool
}

// Level returns the configured log level.
func (c *LogConfig) Level() LogLevel {
	return c.level
}

// Logger returns the configured logger.
func (c *LogConfig) Logger() ILogger {
	return c.logger
}

// Silent returns whether logging is disabled.
func (c *LogConfig) Silent() bool {
	return c.silent
}

// LogConfigBuilder is used to build a LogConfig.
type LogConfigBuilder struct {
	level  LogLevel
	logger ILogger
	silent bool
}

// NewLogConfigBuilder creates a new builder for LogConfig.
func NewLogConfigBuilder() *LogConfigBuilder {
	return &LogConfigBuilder{
		level:  LogLevelInfo,
		logger: NewConsoleLogger(),
		silent: true,
	}
}

// Level sets the minimum log level. Only messages at this level or above will be logged.
// Defaults to LogLevelInfo.
func (b *LogConfigBuilder) Level(level LogLevel) *LogConfigBuilder {
	b.level = level
	return b
}

// Logger sets a custom logger implementation. Defaults to ConsoleLogger.
func (b *LogConfigBuilder) Logger(logger ILogger) *LogConfigBuilder {
	b.logger = logger
	return b
}

// Silent sets whether logging is silent (disabled). Defaults to true.
// Set to false to enable log output.
func (b *LogConfigBuilder) Silent(silent bool) *LogConfigBuilder {
	b.silent = silent
	return b
}

// Build creates the LogConfig with the configured settings.
func (b *LogConfigBuilder) Build() *LogConfig {
	return &LogConfig{
		level:  b.level,
		logger: b.logger,
		silent: b.silent,
	}
}

// createLogger creates a Logger wrapper from the LogConfig.
func (c *LogConfig) createLogger() *Logger {
	return NewLogger(c.logger, c.level, c.silent)
}
