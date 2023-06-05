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

// NewGithubConfig returns a new github writer configuration.
func NewGithubConfig(version string, repoURL string) (*GithubConfig, error) {
	return &GithubConfig{
		Version: version,
		RepoURL: repoURL,
	}, nil
}

type githubWriter struct {
	config *GithubConfig
}

func newGithubWriter(config *GithubConfig) (*githubWriter, error) {
	return &githubWriter{
		config: config,
	}, nil
}

func (g *githubWriter) Root() string {
	return ""
}

func (g *githubWriter) WriteFiles(files []*generator.File) error {
	return errors.New("unimplemented")
}
