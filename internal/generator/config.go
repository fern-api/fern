package generator

import (
	"encoding/json"
	"fmt"
	"os"
)

// Config represents the Fern generator configuration.
type Config struct {
	DryRun       bool          `json:"dryRun,omitempty"`
	IRFilepath   string        `json:"irFilepath,omitempty"`
	Output       *OutputConfig `json:"output,omitempty"`
	Workspace    string        `json:"workspaceName,omitempty"`
	Organization string        `json:"organization,omitempty"`
	Environment  Environment   `json:"environment,omitempty"`
}

// ReadConfig returns a new *Config from the given filename.
func ReadConfig(configFilename string) (*Config, error) {
	bytes, err := os.ReadFile(configFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read generator configuration: %v", err)
	}
	config := new(Config)
	if err := json.Unmarshal(bytes, config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal generator configuration: %v", err)
	}
	return config, nil
}

// OutputConfig represents the target output (i.e. where
// the Fern compiler will write the result).
type OutputConfig struct {
	Path string     `json:"path,omitempty"`
	Mode OutputMode `json:"mode,omitempty"`
}

// OutputMode represents a union of the supported ouptut modes.
// Note that this only includes the subset of output modes that
// are relevant to a Go generator (e.g. GitHub).
type OutputMode interface {
	isOutputMode()
}

// OutputModeGithub is the GitHub OutputMode.
type OutputModeGithub struct {
	Type        string            `json:"type,omitempty"`
	Version     string            `json:"version,omitempty"`
	RepoURL     string            `json:"repoUrl,omitempty"`
	PublishInfo PublishInfoGithub `json:"publishInfo,omitempty"`
}

func (p *OutputModeGithub) isOutputMode() {}

// PublishInfoGithub represents the publish information specific to GitHub.
type PublishInfoGithub interface {
	isPublishInfoGithub()
}

// Environment represents the supported generator environments
// (e.g. local and remote).
type Environment interface {
	isEnvironment()
}

// EnvironmentLocal is the local Environment.
type EnvironmentLocal struct {
	Type string `json:"_type,omitempty"`
}

// EnvironmentRemote is the remote Environment.
type EnvironmentRemote struct {
	Type             string `json:"_type,omitempty"`
	CoordinatorURL   string `json:"coordinatorUrl,omitempty"`
	CoordinatorURLV2 string `json:"coordinatorUrlV2,omitempty"`
	ID               string `json:"id,omitempty"`
}
