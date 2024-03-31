import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { AbstractGeneratorContext, getPackageName, getSdkVersion } from "@fern-api/generator-commons";
import {
    generateBasicTests,
    GeneratedFile,
    generateGemConfig,
    generateGemfile,
    generateGemspec,
    generateGithubWorkflow,
    generateGitignore,
    generateReadme,
    generateRubocopConfig,
    getClientName,
    getGemName
} from "@fern-api/ruby-codegen";
import { AbstractGeneratorCli } from "@fern-api/ruby-generator-cli";
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
    private generateRepositoryBoilerPlate(gemName: string, githubOutputMode: FernGeneratorExec.GithubOutputMode) {
        this.generatedFiles.push(generateGitignore());
        this.generatedFiles.push(generateReadme());

        const githubPublishInfo = githubOutputMode.publishInfo;
        if (githubPublishInfo) {
            if (githubPublishInfo.type !== "rubygems") {
                throw new Error(`Attempting to pass in a publish type that is not rubygems: ${githubPublishInfo.type}`);
            }

            this.generatedFiles.push(
                generateGithubWorkflow(
                    gemName,
                    githubPublishInfo.registryUrl,
                    githubPublishInfo.apiKeyEnvironmentVariable
                )
            );
        }
    }

    private generateRubyBoilerPlate(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        repoUrl?: string
    ) {
        const sdkVersion = getSdkVersion(config);

        const boilerPlateFiles = [];
        boilerPlateFiles.push(generateRubocopConfig());
        boilerPlateFiles.push(generateGemfile());
        boilerPlateFiles.push(generateGemspec(clientName, gemName, [], sdkVersion, config.license));
        boilerPlateFiles.push(generateGemConfig(clientName, repoUrl));
        // boilerPlateFiles.push(...generateBinDir(gemName));

        boilerPlateFiles.push(...generateBasicTests(gemName, clientName));

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        gemName: string,
        clientName: string,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const generatedTypeFiles = new TypesGenerator(
            gemName,
            clientName,
            generatorContext,
            intermediateRepresentation
        ).generateFiles(true);
        this.generatedFiles.push(...Array.from(generatedTypeFiles.values()));
    }

    private generateProject(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        repoUrl?: string
    ) {
        generatorContext.logger.debug("Generating boilerplate");
        this.generateRubyBoilerPlate(gemName, clientName, config, repoUrl);
        generatorContext.logger.debug("Generating types");
        this.generateTypes(gemName, clientName, generatorContext, intermediateRepresentation);
    }

    protected async publishPackage(
        _config: FernGeneratorExec.GeneratorConfig,
        _customConfig: RubyModelCustomConfig,
        _generatorContext: AbstractGeneratorContext,
        _intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Unimplemented Exception");
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubyModelCustomConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void> {
        const gemName = getGemName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName,
            getPackageName(config)
        );
        const clientName = getClientName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName
        );
        this.generateRepositoryBoilerPlate(gemName, githubOutputMode);
        this.generateProject(
            gemName,
            clientName,
            config,
            generatorContext,
            intermediateRepresentation,
            githubOutputMode.repoUrl
        );
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
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        const gemName = getGemName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName,
            getPackageName(config)
        );
        const clientName = getClientName(
            config.organization,
            intermediateRepresentation.apiName.pascalCase.safeName,
            customConfig.clientClassName
        );
        this.generateProject(gemName, clientName, config, generatorContext, intermediateRepresentation);
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
