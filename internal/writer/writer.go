package writer

import (
	"fmt"

	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/generator"
)

// Writer writes files to their configured location.
type Writer interface {
	Root() string
	WriteFiles([]*generator.File) error
}

// New returns a new Writer.
func New(coordinator *coordinator.Client, config *Config) (Writer, error) {
	switch mode := config.Mode.(type) {
	case *GithubConfig:
		return newGithubWriter(coordinator, mode)
	case *LocalConfig:
		return newLocalWriter(mode)
	}
	return nil, fmt.Errorf("unrecognized output mode %T", config.Mode)
}
