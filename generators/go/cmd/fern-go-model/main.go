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

func run(config *cmd.Config, coordinator *coordinator.Client) ([]*generator.File, generator.Mode, error) {
	_, includeReadme := config.Writer.Mode.(*writer.GithubConfig)
	generatorConfig, err := generator.NewConfig(
		config.DryRun,
		config.EnableExplicitNull,
		config.IncludeLegacyClientOptions,
		includeReadme,
		config.Whitelabel,
		config.AlwaysSendRequiredProperties,
		config.InlinePathParameters,
		config.InlineFileProperties,
		config.UseReaderForBytesRequest,
		config.GettersPassByValue,
		config.ExportAllRequestsAtRoot,
		config.Organization,
		config.Version,
		config.IrFilepath,
		config.SnippetFilepath,
		config.ClientName,
		config.ClientConstructorName,
		config.ImportPath,
		config.PackageName,
		config.PackagePath,
		config.ExportedClientName,
		config.UnionVersion,
		"",
		config.Module,
	)
	if err != nil {
		return nil, 0, err
	}
	g, err := generator.New(generatorConfig, coordinator)
	if err != nil {
		return nil, 0, err
	}
	files, err := g.Generate(generator.ModeModel)
	return files, generator.ModeModel, err
}
