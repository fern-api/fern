package main

import (
	"github.com/fern-api/fern-go/internal/cmd"
	"github.com/fern-api/fern-go/internal/coordinator"
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
	cmd.Run(usage, run)
}

func run(config *cmd.Config, coordinator *coordinator.Client) ([]*generator.File, error) {
	_, includeReadme := config.Writer.Mode.(*writer.GithubConfig)
	generatorConfig, err := generator.NewConfig(
		config.DryRun,
		config.EnableExplicitNull,
		config.IncludeLegacyClientOptions,
		includeReadme,
		config.Whitelabel,
		config.Organization,
		config.Version,
		config.IrFilepath,
		config.SnippetFilepath,
		config.ImportPath,
		config.PackageName,
		config.Module,
	)
	if err != nil {
		return nil, err
	}
	g, err := generator.New(generatorConfig, coordinator)
	if err != nil {
		return nil, err
	}
	return g.Generate(generator.ModeModel)
}
