package writer

import (
	"fmt"

	"github.com/fern-api/fern-go/internal/generator"
)

// Writer writes files to their configured location.
type Writer interface {
	Root() string
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
