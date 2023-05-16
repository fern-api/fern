package writer

import (
	"errors"

	"github.com/fern-api/fern-go/internal/generator"
)

// GithubConfig is the GitHub output mode configuration.
type GithubConfig struct {
	Version string
	RepoURL string

	// TODO: Add PublishInfo.
}

func (g *GithubConfig) isOutputMode() {}

type githubWriter struct {
	config *GithubConfig
}

func newGithubWriter(config *GithubConfig) (*githubWriter, error) {
	return &githubWriter{
		config: config,
	}, nil
}

func (g *githubWriter) WriteFiles(files []*generator.File) error {
	return errors.New("unimplemented")
}
