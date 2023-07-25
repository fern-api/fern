package main

import (
	"github.com/fern-api/fern-go/internal/cmd"
	"github.com/fern-api/fern-go/internal/coordinator"
	"github.com/fern-api/fern-go/internal/generator"
)

const usage = `Generate Go clients from your Fern API definition.

Usage:
  fern-go-sdk <config_file_path>

Flags:
  -h, --help     Print this help and exit.
  -v, --version  Print the version and exit.`

func main() {
	cmd.Run(usage, run)
}

func run(config *cmd.Config, coordinator *coordinator.Client) ([]*generator.File, error) {
	generatorConfig, err := generator.NewConfig(
		config.DryRun,
		config.EnableClientSubpackages,
		config.IrFilepath,
		config.ImportPath,
		config.Module,
	)
	if err != nil {
		return nil, err
	}
	g, err := generator.New(generatorConfig, coordinator)
	if err != nil {
		return nil, err
	}
	return g.Generate(generator.ModeClient)
}
