package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/fern-api/fern-go"
	"github.com/fern-api/fern-go/internal/fern/generatorexec"
	"github.com/fern-api/fern-go/internal/generator"
	"github.com/fern-api/fern-go/internal/writer"
)

const usage = `Generate Go models from your Fern API definition.

Usage:
  fern-go-model <config_file_path>

Flags:
  -h, --help     Print this help and exit.
  -v, --version  Print the version and exit.`

func main() {
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
	if err := run(os.Args[1]); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

func run(configFilename string) error {
	config, err := readConfig(configFilename)
	if err != nil {
		return err
	}
	customConfig, err := customConfigFromConfig(config)
	if err != nil {
		return err
	}
	outputMode, err := outputModeFromConfig(config)
	if err != nil {
		return err
	}
	writerConfig, err := writer.NewConfig(outputMode)
	if err != nil {
		return err
	}
	moduleConfig, err := moduleConfigFromCustomConfig(customConfig)
	if err != nil {
		return err
	}
	generatorConfig, err := generator.NewConfig(config.DryRun, config.IrFilepath, customConfig.ImportPath, moduleConfig)
	if err != nil {
		return err
	}
	generator, err := generator.New(generatorConfig)
	if err != nil {
		return err
	}
	files, err := generator.Generate()
	if err != nil {
		return err
	}
	writer, err := writer.New(writerConfig)
	if err != nil {
		return err
	}
	return writer.WriteFiles(files)
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
	ImportPath string        `json:"importPath,omitempty"`
	Module     *moduleConfig `json:"module,omitempty"`
}

type moduleConfig struct {
	Path    string            `json:"path,omitempty"`
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

func moduleConfigFromCustomConfig(customConfig *customConfig) (*generator.ModuleConfig, error) {
	if customConfig.Module == nil || customConfig.Module == (&moduleConfig{}) {
		return nil, nil
	}
	if customConfig.Module.Path == "" && len(customConfig.Module.Imports) > 0 {
		return nil, errors.New("custom module configuration must specify a path")
	}
	return &generator.ModuleConfig{
		Path:    customConfig.Module.Path,
		Imports: customConfig.Module.Imports,
	}, nil
}

func outputModeFromConfig(c *generatorexec.GeneratorConfig) (writer.OutputMode, error) {
	switch outputConfigMode := c.Output.Mode; outputConfigMode.Type {
	case "github":
		return writer.NewGithubConfig(outputConfigMode.Github.Version, outputConfigMode.Github.RepoUrl)
	case "downloadFiles":
		return writer.NewLocalConfig(c.Output.Path)
	default:
		return nil, fmt.Errorf("unrecognized output configuration mode: %T", outputConfigMode)
	}
}
