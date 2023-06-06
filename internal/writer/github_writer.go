package writer

import (
	"os"
	"path/filepath"

	"github.com/fern-api/fern-go/internal/generator"
)

// GithubConfig is the GitHub output mode configuration.
type GithubConfig struct {
	Path    string
	RepoURL string
}

func (g *GithubConfig) isOutputMode() {}

// NewGithubConfig returns a new github writer configuration.
func NewGithubConfig(path string, repoURL string) (*GithubConfig, error) {
	return &GithubConfig{
		Path:    path,
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
	return g.config.Path
}

func (g *githubWriter) WriteFiles(files []*generator.File) error {
	if len(files) == 0 {
		return nil
	}
	if err := os.MkdirAll(g.config.Path, 0755); err != nil {
		return err
	}
	for _, file := range files {
		filename := filepath.Join(g.config.Path, file.Path)
		if err := os.MkdirAll(filepath.Dir(filename), 0755); err != nil {
			return err
		}
		if err := os.WriteFile(filename, file.Content, 0644); err != nil {
			return err
		}
	}
	return nil
}
