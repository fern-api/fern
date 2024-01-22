import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorCli } from "@fern-api/generator-cli";
import { GeneratorContext } from "@fern-api/generator-commons";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { exec } from "child_process";
import { camelCase, upperFirst } from "lodash-es";
import { generateGemConfig, generateGemspec } from "./ast/AbstractionUtilities";
import { parseCustomConfig, RubyModelCustomConfig } from "./CustomConfig";
import { generateBinDir, generateGemfile, generateGitignore, generateReadme, generateRubocopConfig } from "./GemFiles";
import { GeneratedFile } from "./utils/GeneratedFile";
import { TypesGenerator } from "./utils/TypesGenerator";

export class RubyModelGeneratorCli extends AbstractGeneratorCli<RubyModelCustomConfig> {
    // TODO: This will probably be used across CLIs (e.g. storing and then writing these files)
    generatedFiles: GeneratedFile[] = [];

    protected parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
        return parseCustomConfig(customConfig);
    }

    private getGemName(config: FernGeneratorExec.GeneratorConfig, customConfig: RubyModelCustomConfig): string {
        return customConfig.gemName ?? this.getClientName(config, customConfig);
    }

    private getClientName(config: FernGeneratorExec.GeneratorConfig, customConfig: RubyModelCustomConfig): string {
        return customConfig.clientClassName ?? upperFirst(camelCase(config.organization)) + "Client";
    }

    // TODO: This (as an abstract function) will probably be used across CLIs
    private generateRepositoryBoilerPlate(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig
    ) {
        const gemName = this.getGemName(config, customConfig);
        const clientName = this.getClientName(config, customConfig);

        const boilerPlateFiles = [];
        boilerPlateFiles.push(generateGitignore());
        boilerPlateFiles.push(generateRubocopConfig());
        boilerPlateFiles.push(generateGemfile());
        boilerPlateFiles.push(generateReadme());
        boilerPlateFiles.push(generateGemspec(clientName, gemName, []));
        boilerPlateFiles.push(generateGemConfig(clientName));
        boilerPlateFiles.concat(generateBinDir(gemName));

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const generatedTypeFiles = new TypesGenerator(
            RelativeFilePath.of(this.getClientName(config, customConfig)),
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
        this.generateRepositoryBoilerPlate(config, customConfig);
        generatorContext.logger.debug("Generating types");
        this.generateTypes(config, customConfig, generatorContext, intermediateRepresentation);
    }

    protected async publishPackage(
        _config: FernGeneratorExec.GeneratorConfig,
        _customConfig: RubyModelCustomConfig,
        _generatorContext: GeneratorContext,
        _intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Unimplemented Exception");
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
        this.generatedFiles.forEach(async (f) => {
            await f.write(AbsoluteFilePath.of(config.output.path));
        });
        // Run lint and generate lockfile
        exec(`rubocop --auto-correct-all ${config.output.path}`);
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
        // Run lint and generate lockfile
        exec(`rubocop --auto-correct-all ${config.output.path}`);
    }
}
