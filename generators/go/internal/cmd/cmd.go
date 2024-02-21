package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/fern-api/fern-go"
	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/generator"
	"github.com/fern-api/fern-go/internal/goexec"
	"github.com/fern-api/fern-go/internal/writer"
	generatorexec "github.com/fern-api/generator-exec-go"
	"go.uber.org/multierr"
	"golang.org/x/mod/semver"
)

const (
	// localFileGenerationDocsLink is displayed to the user whenever they omit
	// an import path or module path configuration. This is included to help
	// the user understand how to improve the import paths used in the
	// generated SDK.
	localFileGenerationDocsLink = "https://github.com/fern-api/fern-go#local-file-generation"

	// defaultModulePath is used as the default go.mod path used in the generated
	// SDK.
	defaultModulePath = "sdk"
)

var (
	// defaultImports specify the default imports used in the generated
	// go.mod (if any).
	defaultImports = map[string]string{
		"github.com/google/uuid":      "v1.4.0",
		"github.com/stretchr/testify": "v1.7.0",
		"gopkg.in/yaml.v3":            "v3.0.1", // Indirect, but pin to make this stable.
	}

	// defaultModuleConfig is used whenever an import path or module is not
	// specified. This is the default, configuration-less behavior used by
	// the generator.
	defaultModuleConfig = &generator.ModuleConfig{
		Path:    defaultModulePath,
		Imports: defaultImports,
	}
)

// Config represents the common configuration required from all of
// the commands (e.g. fern-go-{client,model}).
type Config struct {
	DryRun                     bool
	EnableExplicitNull         bool
	IncludeLegacyClientOptions bool
	Whitelabel                 bool
	Organization               string
	CoordinatorURL             string
	CoordinatorTaskID          string
	Version                    string
	IrFilepath                 string
	ImportPath                 string
	PackageName                string
	Module                     *generator.ModuleConfig
	Writer                     *writer.Config
}

// GeneratorFunc is a function that generates files.
type GeneratorFunc func(*Config, *coordinator.Client) ([]*generator.File, error)

// Run runs the given command that produces generated files.
func Run(usage string, fn GeneratorFunc) {
	if len(os.Args) == 2 && (os.Args[1] == "--version" || os.Args[1] == "-v") {
		fmt.Fprintln(os.Stdout, fern.Version)
		os.Exit(0)
	}
	if len(os.Args) == 2 && (os.Args[1] == "--help" || os.Args[1] == "-h") {
		fmt.Fprintln(os.Stdout, usage)
		os.Exit(0)
	}
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, usage)
		os.Exit(1)
	}
	if err := run(fn); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

func run(fn GeneratorFunc) (retErr error) {
	config, err := newConfig(os.Args[1])
	if err != nil {
		return err
	}
	coordinator := coordinator.NewClient(config.CoordinatorURL, config.CoordinatorTaskID)
	if err := coordinator.Init(); err != nil {
		return err
	}
	// If the Module configuration is specified, use the module's path as the import path.
	if config.Module != nil {
		if config.ImportPath == "" {
			config.ImportPath = config.Module.Path
		}
		if config.ImportPath != config.Module.Path {
			return fmt.Errorf(
				"both module path (%q) and import path (%q) are specified, but not equal; please remove import path",
				config.Module.Path,
				config.ImportPath,
			)
		}
	}
	if config.ImportPath == "" {
		// If neither an import path nor a module path are specified, use the default behavior so
		// that we can still successfully generate a result.
		if err := coordinator.Log(
			generatorexec.LogLevelWarn,
			fmt.Sprintf("Neither an import path nor a module path was specified; please see %s for details.", localFileGenerationDocsLink),
		); err != nil {
			return err
		}
		if config.Module == nil {
			config.Module = defaultModuleConfig
		} else {
			// A module configuration is specified, so we only want to set the path to something meaningful.
			config.Module.Path = defaultModuleConfig.Path
		}
		config.ImportPath = config.Module.Path
	}
	if suffix, ok := parseMajorVersion(config.Version); ok {
		// Append the major version suffix for any version greater than 1.X.X.
		//
		// For details, see https://github.com/golang/go/issues/35732
		config.ImportPath = maybeAppendVersionSuffix(config.ImportPath, suffix)
		config.Module.Path = maybeAppendVersionSuffix(config.Module.Path, suffix)
	}
	defer func() {
		exitStatusUpdate := generatorexec.NewExitStatusUpdateFromSuccessful(new(generatorexec.SuccessfulStatusUpdate))
		if retErr != nil {
			// The generator returned an error, so we send an error update to the coordinator.
			exitStatusUpdate = generatorexec.NewExitStatusUpdateFromError(
				&generatorexec.ErrorExitStatusUpdate{
					Message: retErr.Error(),
				},
			)
		}
		retErr = multierr.Append(retErr, coordinator.Exit(exitStatusUpdate))
	}()
	files, err := fn(config, coordinator)
	if err != nil {
		return err
	}
	if err := writeFiles(coordinator, config.Writer, config.Module, files); err != nil {
		return err
	}
	return nil
}

// newConfig returns the *Config found at the given configFilename.
func newConfig(configFilename string) (*Config, error) {
	config, err := readConfig(configFilename)
	if err != nil {
		return nil, err
	}
	customConfig, err := customConfigFromConfig(config)
	if err != nil {
		return nil, err
	}
	outputMode, err := outputModeFromConfig(config)
	if err != nil {
		return nil, err
	}
	writerConfig, err := writer.NewConfig(outputMode)
	if err != nil {
		return nil, err
	}
	moduleConfig, err := moduleConfigFromCustomConfig(customConfig, outputMode)
	if err != nil {
		return nil, err
	}

	var (
		coordinatorURL    string
		coordinatorTaskID string
	)
	if config.Environment != nil && config.Environment.Remote != nil {
		coordinatorURL = config.Environment.Remote.CoordinatorUrlV2
		coordinatorTaskID = config.Environment.Remote.Id
	}
	return &Config{
		DryRun:                     config.DryRun,
		IncludeLegacyClientOptions: customConfig.IncludeLegacyClientOptions,
		EnableExplicitNull:         customConfig.EnableExplicitNull,
		Organization:               config.Organization,
		Whitelabel:                 config.Whitelabel,
		CoordinatorURL:             coordinatorURL,
		CoordinatorTaskID:          coordinatorTaskID,
		Version:                    outputVersionFromGeneratorConfig(config),
		IrFilepath:                 config.IrFilepath,
		ImportPath:                 customConfig.ImportPath,
		PackageName:                customConfig.PackageName,
		Module:                     moduleConfig,
		Writer:                     writerConfig,
	}, nil
}

// writeFiles writes the given files according to the configuration.
func writeFiles(
	coordinator *coordinator.Client,
	writerConfig *writer.Config,
	moduleConfig *generator.ModuleConfig,
	files []*generator.File,
) error {
	writer, err := writer.New(coordinator, writerConfig)
	if err != nil {
		return err
	}
	if err := writer.WriteFiles(files); err != nil {
		return err
	}
	// If a module file was written, we still need to generate the go.sum.
	if moduleConfig != nil {
		return goexec.RunTidy(writer.Root())
	}
	return nil
}

// readConfig returns the generator configuration from the given filename.
func readConfig(configFilename string) (*generatorexec.GeneratorConfig, error) {
	bytes, err := os.ReadFile(configFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read generator configuration: %v", err)
	}
	config := new(generatorexec.GeneratorConfig)
	if err := json.Unmarshal(bytes, config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal generator configuration: %v", err)
	}
	return config, nil
}

type customConfig struct {
	EnableExplicitNull         bool          `json:"enableExplicitNull,omitempty"`
	IncludeLegacyClientOptions bool          `json:"includeLegacyClientOptions,omitempty"`
	ImportPath                 string        `json:"importPath,omitempty"`
	PackageName                string        `json:"packageName,omitempty"`
	Module                     *moduleConfig `json:"module,omitempty"`
}

type moduleConfig struct {
	Path    string            `json:"path,omitempty"`
	Version string            `json:"version,omitempty"`
	Imports map[string]string `json:"imports,omitempty"`
}

func customConfigFromConfig(c *generatorexec.GeneratorConfig) (*customConfig, error) {
	if c.CustomConfig == nil {
		return &customConfig{}, nil
	}
	configBytes, err := json.Marshal(c.CustomConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize custom configuration: %v", err)
	}
	// We use a custom decoder here to validate the custom configuration fields.
	decoder := json.NewDecoder(bytes.NewReader(configBytes))
	decoder.DisallowUnknownFields()

	config := new(customConfig)
	if err := decoder.Decode(config); err != nil {
		return nil, fmt.Errorf("failed to read custom configuration: %v", err)
	}
	return config, nil
}

func moduleConfigFromCustomConfig(customConfig *customConfig, outputMode writer.OutputMode) (*generator.ModuleConfig, error) {
	githubConfig, ok := outputMode.(*writer.GithubConfig)
	if !ok && customConfig.Module == nil || customConfig.Module == (&moduleConfig{}) {
		// Neither a GitHub configuration nor a module configuration were provided.
		return nil, nil
	}
	var modulePath string
	if ok {
		modulePath = strings.TrimPrefix(githubConfig.RepoURL, "https://")
	}
	if customConfig.Module == nil || customConfig.Module == (&moduleConfig{}) {
		// A GitHub configuration was provided, so the module config should use
		// the GitHub configuration's repository url.
		return &generator.ModuleConfig{
			Path:    modulePath,
			Imports: defaultImports,
		}, nil
	}
	if customConfig.Module.Path != "" {
		// The user explicitly specified a module path, so we should use it.
		modulePath = customConfig.Module.Path
	}
	imports := customConfig.Module.Imports
	if imports == nil {
		imports = defaultImports
	}
	return &generator.ModuleConfig{
		Path:    modulePath,
		Version: customConfig.Module.Version, // If not specified, defaults to the Go command's current version.
		Imports: imports,
	}, nil
}

func outputModeFromConfig(c *generatorexec.GeneratorConfig) (writer.OutputMode, error) {
	switch outputConfigMode := c.Output.Mode; outputConfigMode.Type {
	case "github":
		return writer.NewGithubConfig(c.Output.Path, outputConfigMode.Github.RepoUrl)
	case "downloadFiles":
		return writer.NewLocalConfig(c.Output.Path)
	default:
		return nil, fmt.Errorf("unrecognized output configuration mode: %T", outputConfigMode)
	}
}

func outputVersionFromGeneratorConfig(c *generatorexec.GeneratorConfig) string {
	visitor := new(outputModeVersionVisitor)
	if err := c.Output.Mode.Accept(visitor); err == nil {
		return visitor.value
	}
	return ""
}

type outputModeVersionVisitor struct {
	value string
}

func (o *outputModeVersionVisitor) VisitPublish(publishConfig *generatorexec.GeneratorPublishConfig) error {
	o.value = publishConfig.Version
	return nil
}

func (o *outputModeVersionVisitor) VisitDownloadFiles(_ any) error {
	return nil
}

func (o *outputModeVersionVisitor) VisitGithub(outputMode *generatorexec.GithubOutputMode) error {
	o.value = outputMode.Version
	return nil
}

// parseMajorVersion returns the major version, and returns true if
// it is greater than 1.X.X (e.g. v2.0.0).
func parseMajorVersion(version string) (string, bool) {
	major := semver.Major(version)
	return major, major != "" && major != "v0" && major != "v1"
}

// maybeAppendVersionSuffix appends the given version suffix to the
// importPath if it doesn't already exist.
func maybeAppendVersionSuffix(importPath string, version string) string {
	if path.Base(importPath) == version {
		return importPath
	}
	return path.Join(importPath, version)
}
