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

// UnmarshalJSON implements json.Unmarshaler.
func (c *Config) UnmarshalJSON(data []byte) error {
	var raw struct {
		DryRun       bool            `json:"dryRun,omitempty"`
		IRFilepath   string          `json:"irFilepath,omitempty"`
		Output       *OutputConfig   `json:"output,omitempty"`
		Workspace    string          `json:"workspaceName,omitempty"`
		Organization string          `json:"organization,omitempty"`
		Environment  json.RawMessage `json:"environment,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	c.DryRun = raw.DryRun
	c.IRFilepath = raw.IRFilepath
	c.Output = raw.Output
	c.Workspace = raw.Workspace
	c.Organization = raw.Organization

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var environment struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.Environment, &environment); err != nil {
		return err
	}
	if environment.Type != "" {
		switch environment.Type {
		case "local":
			c.Environment = new(EnvironmentLocal)
		case "remote":
			c.Environment = new(EnvironmentRemote)
		default:
			return fmt.Errorf("unrecognized %T type: %v", c.Environment, environment.Type)
		}
		if err := json.Unmarshal(raw.Environment, c.Environment); err != nil {
			return err
		}
	}
	return nil
}

// ReadConfig returns a new *Config from the given filename.
func ReadConfig(configFilename string) (*Config, error) {
	bytes, err := os.ReadFile(configFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read generator configuration: %v", err)
	}
	// Add some debugging for now.
	fmt.Println(bytes)
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

// UnmarshalJSON implements json.Unmarshaler.
func (o *OutputConfig) UnmarshalJSON(data []byte) error {
	var raw struct {
		Path string          `json:"path,omitempty"`
		Mode json.RawMessage `json:"mode,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	o.Path = raw.Path

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var mode struct {
		Type string `json:"type,omitempty"`
	}
	if err := json.Unmarshal(raw.Mode, &mode); err != nil {
		return err
	}
	if mode.Type != "" {
		switch mode.Type {
		case "github":
			o.Mode = new(OutputModeGithub)
		case "downloadFiles":
			o.Mode = new(OutputModeDownloadFiles)
		default:
			return fmt.Errorf("unrecognized %T type: %v", o.Mode, mode.Type)
		}
		if err := json.Unmarshal(raw.Mode, o.Mode); err != nil {
			return err
		}
	}
	return nil
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

// OutputModeDownloadFiles is the download files OutputMode.
type OutputModeDownloadFiles struct {
	Type string `json:"type,omitempty"`
}

func (p *OutputModeDownloadFiles) isOutputMode() {}

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

func (e *EnvironmentLocal) isEnvironment() {}

// EnvironmentRemote is the remote Environment.
type EnvironmentRemote struct {
	Type             string `json:"_type,omitempty"`
	CoordinatorURL   string `json:"coordinatorUrl,omitempty"`
	CoordinatorURLV2 string `json:"coordinatorUrlV2,omitempty"`
	ID               string `json:"id,omitempty"`
}

func (e *EnvironmentRemote) isEnvironment() {}
