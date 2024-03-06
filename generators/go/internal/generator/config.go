package generator

import "fmt"

// UnionVersion represents the different union versions supported by the generator.
type UnionVersion uint

// Enumerates the supported union versions.
const (
	UnionVersionUnspecified UnionVersion = iota
	UnionVersionV0
	UnionVersionV1
)

// Config represents the Fern generator configuration.
type Config struct {
	DryRun                     bool
	EnableExplicitNull         bool
	IncludeLegacyClientOptions bool
	IncludeReadme              bool
	Whitelabel                 bool
	Organization               string
	Version                    string
	IRFilepath                 string
	SnippetFilepath            string
	ImportPath                 string
	UnionVersion               UnionVersion
	PackageName                string

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
	//  "github.com/google/uuid": "v1.4.0"
	//  "github.com/testify/stretchr": "v1.7.0"
	//  "gopkg.in/yaml.v3": "v3.0.1"
	Imports map[string]string
}

// NewConfig returns a new *Config for the given values.
func NewConfig(
	dryRun bool,
	enableExplicitNull bool,
	includeLegacyClientOptions bool,
	includeReadme bool,
	whitelabel bool,
	organization string,
	version string,
	irFilepath string,
	snippetFilepath string,
	importPath string,
	packageName string,
	unionVersion string,
	moduleConfig *ModuleConfig,
) (*Config, error) {
	uv, err := parseUnionVersion(unionVersion)
	if err != nil {
		return nil, err
	}
	return &Config{
		DryRun:                     dryRun,
		EnableExplicitNull:         enableExplicitNull,
		IncludeLegacyClientOptions: includeLegacyClientOptions,
		IncludeReadme:              includeReadme,
		Organization:               organization,
		Whitelabel:                 whitelabel,
		Version:                    version,
		IRFilepath:                 irFilepath,
		SnippetFilepath:            snippetFilepath,
		ImportPath:                 importPath,
		PackageName:                packageName,
		UnionVersion:               uv,
		ModuleConfig:               moduleConfig,
	}, nil
}

func parseUnionVersion(unionVersion string) (UnionVersion, error) {
	switch unionVersion {
	case "":
		return UnionVersionUnspecified, nil
	case "v0":
		return UnionVersionV0, nil
	case "v1":
		return UnionVersionV1, nil
	}
	return UnionVersionUnspecified, fmt.Errorf("unrecognized union version %q", unionVersion)
}
