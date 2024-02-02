import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorCli } from "@fern-api/generator-cli";
import { GeneratorContext, getSdkVersion } from "@fern-api/generator-commons";
import {
    GeneratedFile,
    generateGemConfig,
    generateGemfile,
    generateGemspec,
    generateGitignore,
    generateReadme,
    generateRubocopConfig,
    getClientName,
    getGemName
} from "@fern-api/ruby-codegen";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { execSync } from "child_process";
import { parseCustomConfig, RubyModelCustomConfig } from "./CustomConfig";
import { TypesGenerator } from "./TypesGenerator";

export class RubyModelGeneratorCli extends AbstractGeneratorCli<RubyModelCustomConfig> {
    // TODO: This will probably be used across CLIs (e.g. storing and then writing these files)
    generatedFiles: GeneratedFile[] = [];

    protected parseCustomConfig(customConfig: unknown): RubyModelCustomConfig {
        return parseCustomConfig(customConfig);
    }

    // TODO: This (as an abstract function) will probably be used across CLIs
    private generateRepositoryBoilerPlate(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const gemName = getGemName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName,
            customConfig.gemName
        );
        const clientName = getClientName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName
        );
        const sdkVersion = getSdkVersion(config);

        const boilerPlateFiles = [];
        boilerPlateFiles.push(generateGitignore());
        boilerPlateFiles.push(generateRubocopConfig());
        boilerPlateFiles.push(generateGemfile());
        boilerPlateFiles.push(generateReadme());
        boilerPlateFiles.push(generateGemspec(clientName, gemName, [], sdkVersion));
        boilerPlateFiles.push(generateGemConfig(clientName));
        // boilerPlateFiles.push(...generateBinDir(gemName));

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const generatedTypeFiles = new TypesGenerator(
            getGemName(
                config.organization,
                intermediateRepresentation.apiName.pascalCase.safeName,
                customConfig.clientClassName,
                customConfig.gemName
            ),
            getClientName(
                config.organization,
                intermediateRepresentation.apiName.pascalCase.safeName,
                customConfig.clientClassName
            ),
            generatorContext,
            intermediateRepresentation
        ).generateFiles(true);
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
        this.generateRepositoryBoilerPlate(config, customConfig, intermediateRepresentation);
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
        await Promise.all(
            this.generatedFiles.map(async (f) => {
                await f.write(AbsoluteFilePath.of(config.output.path));
            })
        );
        // Run lint and generate lockfile
        try {
            execSync(`rubocop --autocorrect-all ${config.output.path}`);
        } catch {
            // NOOP, ignore warns
        }
    }
    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        this.generateProject(config, customConfig, generatorContext, intermediateRepresentation);
        await Promise.all(
            this.generatedFiles.map(async (f) => {
                await f.write(AbsoluteFilePath.of(config.output.path));
            })
        );
        // Run lint and generate lockfile
        try {
            execSync(`rubocop --autocorrect-all ${config.output.path}`);
        } catch {
            // NOOP, ignore warns
        }
    }
}
