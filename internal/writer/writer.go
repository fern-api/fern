package writer

import (
	"fmt"

	"github.com/fern-api/fern-go/internal/generator"
)

// Config is the configuration required for writing files.
type Config struct {
	Mode OutputMode
}

// OutputMode is the output mode that describes where
// the Writer should write files.
type OutputMode interface {
	isOutputMode()
}

// Writer writes files to their configured location.
type Writer interface {
	WriteFiles([]*generator.File) error
}

// New returns a new Writer.
func New(config *Config) (Writer, error) {
	switch mode := config.Mode.(type) {
	case *GithubConfig:
		return newGithubWriter(mode)
	case *LocalConfig:
		return newLocalWriter(mode)
	}
	return nil, fmt.Errorf("unrecognized output mode %T", config.Mode)
}
