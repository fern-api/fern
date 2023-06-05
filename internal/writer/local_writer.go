package writer

import (
	"os"
	"path/filepath"

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

func (l *localWriter) Root() string {
	return l.config.Path
}

func (l *localWriter) WriteFiles(files []*generator.File) error {
	if len(files) == 0 {
		return nil
	}
	if err := os.MkdirAll(l.config.Path, 0755); err != nil {
		return err
	}
	for _, file := range files {
		filename := filepath.Join(l.config.Path, file.Path)
		if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
			return err
		}
		if err := os.WriteFile(filename, file.Content, 0644); err != nil {
			return err
		}
	}
	return nil
}
