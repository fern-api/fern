package writer

// Config is the configuration required for writing files.
type Config struct {
	Mode OutputMode
}

// OutputMode is the output mode that describes where
// the Writer should write files.
type OutputMode interface {
	isOutputMode()
}

// NewConfig returns a new writer configuration.
func NewConfig(outputMode OutputMode) (*Config, error) {
	return &Config{
		Mode: outputMode,
	}, nil
}
