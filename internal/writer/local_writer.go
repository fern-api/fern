package writer

import (
	"errors"

	"github.com/fern-api/fern-go/internal/generator"
)

// LocalConfig is the local output mode configuration.
type LocalConfig struct {
	Path string
}

func (l *LocalConfig) isOutputMode() {}

// NewLocalConfig returns a new local writer configuration.
func NewLocalConfig(path string) (*LocalConfig, error) {
	return &LocalConfig{
		Path: path,
	}, nil
}

type localWriter struct {
	config *LocalConfig
}

func newLocalWriter(config *LocalConfig) (*localWriter, error) {
	return &localWriter{
		config: config,
	}, nil
}

func (l *localWriter) WriteFiles(files []*generator.File) error {
	return errors.New("unimplemented")
}
