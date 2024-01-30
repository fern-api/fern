import { TypesGenerator } from "@fern-api/fern-ruby-model";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorCli } from "@fern-api/generator-cli";
import { GeneratorContext, getSdkVersion } from "@fern-api/generator-commons";
import {
    generateBinDir,
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
import { ClientsGenerator } from "./ClientsGenerator";
import { parseCustomConfig, RubySdkCustomConfig } from "./CustomConfig";

export class RubySdkGeneratorCli extends AbstractGeneratorCli<RubySdkCustomConfig> {
    generatedFiles: GeneratedFile[] = [];

    protected parseCustomConfig(customConfig: unknown): RubySdkCustomConfig {
        return parseCustomConfig(customConfig);
    }

    private generateRepositoryBoilerPlate(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
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
        boilerPlateFiles.concat(generateBinDir(gemName));

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
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
        ).generateFiles();
        this.generatedFiles.push(...Array.from(generatedTypeFiles.values()));
    }

    private generateClients(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const sdkVersion = getSdkVersion(config);
        const generatedClientFiles = new ClientsGenerator(
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
            intermediateRepresentation,
            sdkVersion
        ).generateFiles();
        this.generatedFiles.push(...Array.from(generatedClientFiles.values()));
    }

    private generateProject(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        generatorContext.logger.debug("Generating boilerplate");
        this.generateRepositoryBoilerPlate(config, customConfig, intermediateRepresentation);
        generatorContext.logger.debug("Generating types");
        this.generateTypes(config, customConfig, generatorContext, intermediateRepresentation);
        generatorContext.logger.debug("Generating clients");
        this.generateClients(config, customConfig, generatorContext, intermediateRepresentation);
    }

    protected async publishPackage(
        _config: FernGeneratorExec.GeneratorConfig,
        _customConfig: RubySdkCustomConfig,
        _generatorContext: GeneratorContext,
        _intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Unimplemented Exception");
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
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
        customConfig: RubySdkCustomConfig,
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
