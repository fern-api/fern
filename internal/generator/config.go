package generator

// Config represents the Fern generator configuration.
type Config struct {
	DryRun     bool
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
	//  "github.com/gofrs/uuid/v5": "v5.0.0"
	Imports map[string]string
}

// NewConfig returns a new *Config for the given values.
func NewConfig(dryRun bool, irFilepath string, importPath string, moduleConfig *ModuleConfig) (*Config, error) {
	return &Config{
		DryRun:       dryRun,
		IRFilepath:   irFilepath,
		ImportPath:   importPath,
		ModuleConfig: moduleConfig,
	}, nil
}
