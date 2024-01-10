import { AbstractGeneratorCli } from "@fern-api/generator-cli";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { RubyModelCustomConfig, RubyModelCustomConfigSchema } from "./CustomConfig";
import { GeneratedFile } from "./utils/GeneratedFile";
import { TypesGenerator } from "./utils/TypesGenerator";

export class RubyModelGeneratorCli extends AbstractGeneratorCli<RubyModelCustomConfig> {
    // TODO: This will probably be used across CLIs (e.g. storing and then writing these files)
    generatedFiles: GeneratedFile[] = [];

    protected parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
        const parsed = customConfig != null ? RubyModelCustomConfigSchema.parse(customConfig) : undefined;
        return {
            defaultTimeoutInSeconds: parsed?.defaultTimeoutInSeconds ?? parsed?.defaultTimeoutInSeconds,
            extraDependencies: parsed?.extraDependencies ?? {},
            noOptionalProperties: parsed?.noOptionalProperties ?? false,
        };
    }

    // TODO: This (as an abstract function) will probably be used across CLIs
    private generateRepositoryBoilerPlate(config: FernGeneratorExec.GeneratorConfig, customConfig: RubyModelCustomConfig) {
        // Static files and dependencies
    }

    private generateTypes(config: FernGeneratorExec.GeneratorConfig, customConfig: RubyModelCustomConfig, intermediateRepresentation: IntermediateRepresentation) {
        const generatedTypeFiles = new TypesGenerator(intermediateRepresentation).generateFiles();
        this.generatedFiles.push(...Array.from(generatedTypeFiles.values()));
    }

    private generateProject(
        // TODO: leverage config for file gen
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
    ) {
        generatorContext.logger.debug("Generating boilerplate");
        this.generateRepositoryBoilerPlate(config, customConfig);
        generatorContext.logger.debug("Generating types");
        this.generateTypes(config, customConfig, intermediateRepresentation);
    }

    protected async publishPackage(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
    }
    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
    }
}
