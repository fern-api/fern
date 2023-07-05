package writer

import (
	_ "embed"
	"os"
	"path/filepath"

	"github.com/fern-api/fern-go/internal/generator"
)

// githubActionsFilename is the name of the generated GitHub actions file.
const githubActionsFilename = ".github/workflows/ci.yml"

//go:embed workflows/ci.yml
var githubActionsFile string

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
	// If we're writing to a GitHub repository, we want to include a GitHub Actions
	// workflow that verifies the generated code compiles.
	files = append(files, newGitHubActionsFile())
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

// newCIWorkflowFile returns a new Github Actions
func newGitHubActionsFile() *generator.File {
	return &generator.File{
		Path:    githubActionsFilename,
		Content: []byte(githubActionsFile),
	}
}
