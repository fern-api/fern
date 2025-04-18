import { cp } from "fs/promises";

import { AbstractGeneratorContext, getPackageName, getSdkVersion } from "@fern-api/base-generator";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import {
    GeneratedFile,
    generateBasicRakefile,
    generateBasicTests,
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

import { RubyModelCustomConfig, parseCustomConfig } from "./CustomConfig";
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
        boilerPlateFiles.push(generateGemfile([]));
        boilerPlateFiles.push(generateGemspec(clientName, gemName, [], sdkVersion, config.license));
        boilerPlateFiles.push(generateGemConfig(clientName, repoUrl));

        boilerPlateFiles.push(...generateBasicTests(gemName, clientName));
        boilerPlateFiles.push(generateBasicRakefile());

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        gemName: string,
        clientName: string,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const generatedTypeFiles = new TypesGenerator({
            gemName,
            clientName,
            generatorContext,
            intermediateRepresentation,
            shouldFlattenModules: false
        }).generateFiles(true);
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
        generatorContext.logger.debug("[Ruby] Generating Ruby project boilerplate.");
        this.generateRubyBoilerPlate(gemName, clientName, config, repoUrl);
        generatorContext.logger.debug("[Ruby] Generating Ruby classes.");
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
        generatorContext.logger.debug("[Ruby] Generating repository boilerplate.");
        this.generateRepositoryBoilerPlate(gemName, githubOutputMode);
        generatorContext.logger.debug("[Ruby] Generating Ruby project.");
        this.generateProject(
            gemName,
            clientName,
            config,
            generatorContext,
            intermediateRepresentation,
            githubOutputMode.repoUrl
        );

        generatorContext.logger.debug("[Ruby] Writing files to disk.");
        const outputDir = AbsoluteFilePath.of("/fern/ruby_output");
        for (const file of this.generatedFiles) {
            await file.write(outputDir);
        }
        generatorContext.logger.debug("[Ruby] Done writing files to disk.");
        // Run lint and generate lockfile
        try {
            generatorContext.logger.debug("[Ruby] Running linting and formatting via Rubocop.");
            await loggingExeca(generatorContext.logger, "rubocop", [
                "--server",
                "-A",
                "--cache",
                "true",
                "--display-time",
                outputDir
            ]);
        } catch {
            // NOOP, ignore warns
            generatorContext.logger.debug("[Ruby] Could not run linting, step skipped.");
        }
        generatorContext.logger.debug("[Ruby] Copying files to output directory.");
        await cp(outputDir, AbsoluteFilePath.of(config.output.path), { recursive: true });
        generatorContext.logger.debug("[Ruby] Done copying files to output directory.");

        return;
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
        generatorContext.logger.debug("[Ruby] Generating Ruby project.");
        this.generateProject(gemName, clientName, config, generatorContext, intermediateRepresentation);

        generatorContext.logger.debug("[Ruby] Writing files to disk.");
        const outputDir = AbsoluteFilePath.of("/fern/ruby_output");
        for (const file of this.generatedFiles) {
            await file.write(outputDir);
        }
        generatorContext.logger.debug("[Ruby] Done writing files to disk.");
        // Run lint and generate lockfile
        try {
            generatorContext.logger.debug("[Ruby] Running linting and formatting via Rubocop.");
            await loggingExeca(generatorContext.logger, "rubocop", [
                "--server",
                "-A",
                "--cache",
                "true",
                "--display-time",
                outputDir
            ]);
        } catch {
            // NOOP, ignore warns
            generatorContext.logger.debug("[Ruby] Could not run linting, step skipped.");
        }

        generatorContext.logger.debug("[Ruby] Copying files to output directory.");
        await cp(outputDir, AbsoluteFilePath.of(config.output.path), { recursive: true });
        generatorContext.logger.debug("[Ruby] Done copying files to output directory.");

        return;
    }
}
