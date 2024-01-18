import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorCli } from "@fern-api/generator-cli";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { parseCustomConfig, RubyModelCustomConfig } from "./CustomConfig";
import { GeneratedFile } from "./utils/GeneratedFile";
import { TypesGenerator } from "./utils/TypesGenerator";

export class RubyModelGeneratorCli extends AbstractGeneratorCli<RubyModelCustomConfig> {
    // TODO: This will probably be used across CLIs (e.g. storing and then writing these files)
    generatedFiles: GeneratedFile[] = [];

    protected parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
        return parseCustomConfig(customConfig);
    }

    // TODO: This (as an abstract function) will probably be used across CLIs
    // private generateRepositoryBoilerPlate(
    //     config: FernGeneratorExec.GeneratorConfig,
    //     customConfig: RubyModelCustomConfig
    // ) {
    private generateRepositoryBoilerPlate() {
        // Static files and dependencies (.github/, bin/, .gitignore, .rubocop_*, Gemfile, Rakefile, README)
    }

    private generateTypes(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const generatedTypeFiles = new TypesGenerator(
            config,
            customConfig,
            generatorContext,
            intermediateRepresentation
        ).generateFiles();
        this.generatedFiles.push(...Array.from(generatedTypeFiles.values()));
    }

    private generateProject(
        // TODO: leverage config for file gen
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        generatorContext.logger.debug("Generating boilerplate");
        this.generateRepositoryBoilerPlate();
        generatorContext.logger.debug("Generating types");
        this.generateTypes(config, customConfig, generatorContext, intermediateRepresentation);
    }

    protected async publishPackage(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
    }
    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
        this.generatedFiles.forEach(async (f) => {
            await f.write(AbsoluteFilePath.of(config.output.path));
        });
    }
}
