package generator

// Config represents the Fern generator configuration.
type Config struct {
	DryRun     bool
	Version    string
	IRFilepath string
	ImportPath string

	// If not specified, a go.mod and go.sum will not be generated.
	ModuleConfig *ModuleConfig
}

// ModuleConfig represents the configuration used to generate
// a go.mod and go.sum.
type ModuleConfig struct {
	Path    string
	Version string

	// Map from import path to version.
	//
	// The default value is
	//
	//  "github.com/google/uuid": "v1.3.1"
	//  "github.com/testify/stretchr": "v1.7.0"
	Imports map[string]string
}

// NewConfig returns a new *Config for the given values.
func NewConfig(
	dryRun bool,
	version string,
	irFilepath string,
	importPath string,
	moduleConfig *ModuleConfig,
) (*Config, error) {
	return &Config{
		DryRun:       dryRun,
		Version:      version,
		IRFilepath:   irFilepath,
		ImportPath:   importPath,
		ModuleConfig: moduleConfig,
	}, nil
}
