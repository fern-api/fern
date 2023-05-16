package main

import (
	"fmt"
	"os"

	"github.com/fern-api/fern-go"
	"github.com/fern-api/fern-go/internal/config"
	"github.com/fern-api/fern-go/internal/generator"
	"github.com/fern-api/fern-go/internal/writer"
)

const usage = `Generate Go models from your Fern API definition.

Usage:
  fern-go <config_file_path>

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
	config, err := config.ReadConfig(configFilename)
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
	generatorConfig, err := generator.NewConfig(config.DryRun, config.IRFilepath)
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

func outputModeFromConfig(c *config.Config) (writer.OutputMode, error) {
	switch outputConfigMode := c.Output.Mode.(type) {
	case *config.OutputModeGithub:
		return writer.NewGithubConfig(outputConfigMode.Version, outputConfigMode.RepoURL)
	case *config.OutputModeDownloadFiles:
		return writer.NewLocalConfig(c.Output.Path)
	default:
		return nil, fmt.Errorf("unrecognized output configuration mode: %T", outputConfigMode)
	}
}
