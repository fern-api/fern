package generator

import (
	"fmt"
	"path"
)

// PackageLayout represents the different package layouts supported by the generator.
type PackageLayout uint

// Enumerates the supported package layouts.
const (
	PackageLayoutUnspecified PackageLayout = iota
	PackageLayoutNested
	PackageLayoutFlat
)

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
	DryRun                       bool
	EnableExplicitNull           bool
	IncludeLegacyClientOptions   bool
	IncludeReadme                bool
	Whitelabel                   bool
	AlwaysSendRequiredProperties bool
	InlinePathParameters         bool
	InlineFileProperties         bool
	UseReaderForBytesRequest     bool
	Organization                 string
	Version                      string
	IRFilepath                   string
	SnippetFilepath              string
	ClientName                   string
	ClientConstructorName        string
	FullImportPath               string
	PackageName                  string
	PackagePath                  string
	ExportedClientName           string
	PackageLayout                PackageLayout
	UnionVersion                 UnionVersion

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
	alwaysSendRequiredProperties bool,
	inlinePathParameters bool,
	inlineFileProperties bool,
	useReaderForBytesRequest bool,
	organization string,
	version string,
	irFilepath string,
	snippetFilepath string,
	clientName string,
	clientConstructorName string,
	importPath string,
	packageName string,
	packagePath string,
	exportedClientName string,
	packageLayout string,
	unionVersion string,
	moduleConfig *ModuleConfig,
) (*Config, error) {
	pl, err := parsePackageLayout(packageLayout)
	if err != nil {
		return nil, err
	}
	uv, err := parseUnionVersion(unionVersion)
	if err != nil {
		return nil, err
	}
	return &Config{
		DryRun:                       dryRun,
		EnableExplicitNull:           enableExplicitNull,
		IncludeLegacyClientOptions:   includeLegacyClientOptions,
		IncludeReadme:                includeReadme,
		Organization:                 organization,
		Whitelabel:                   whitelabel,
		AlwaysSendRequiredProperties: alwaysSendRequiredProperties,
		InlinePathParameters:         inlinePathParameters,
		InlineFileProperties:         inlineFileProperties,
		UseReaderForBytesRequest:     useReaderForBytesRequest,
		Version:                      version,
		IRFilepath:                   irFilepath,
		SnippetFilepath:              snippetFilepath,
		ClientName:                   clientName,
		ClientConstructorName:        clientConstructorName,
		FullImportPath:               path.Join(importPath, packagePath),
		PackageName:                  packageName,
		PackagePath:                  packagePath,
		ExportedClientName:           exportedClientName,
		PackageLayout:                pl,
		UnionVersion:                 uv,
		ModuleConfig:                 moduleConfig,
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

func parsePackageLayout(packageLayout string) (PackageLayout, error) {
	switch packageLayout {
	case "":
		return PackageLayoutUnspecified, nil
	case "nested":
		return PackageLayoutNested, nil
	case "flat":
		return PackageLayoutFlat, nil
	}
	return PackageLayoutUnspecified, fmt.Errorf("unrecognized package layout %q", packageLayout)
}
