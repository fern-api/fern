package main

import (
	"github.com/fern-api/fern-go/internal/cmd"
	"github.com/fern-api/fern-go/internal/generator"
)

const usage = `Generate Go models from your Fern API definition.

Usage:
  fern-go-model <config_file_path>

Flags:
  -h, --help     Print this help and exit.
  -v, --version  Print the version and exit.`

func main() {
	cmd.Run(usage, run)
}

func run(config *cmd.Config) ([]*generator.File, error) {
	generatorConfig, err := generator.NewConfig(config.DryRun, config.IrFilepath, config.ImportPath, config.Module)
	if err != nil {
		return nil, err
	}
	generator, err := generator.New(generatorConfig)
	if err != nil {
		return nil, err
	}
	return generator.Generate()
}
