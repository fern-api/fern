import { TypesGenerator } from "@fern-api/fern-ruby-model";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    AbstractGeneratorContext,
    getPackageName,
    getSdkVersion,
    hasFileUploadEndpoints
} from "@fern-api/generator-commons";
import {
    Class_,
    generateBasicRakefile,
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
import { IntermediateRepresentation, ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";
import { execSync } from "child_process";
import { ClientsGenerator } from "./ClientsGenerator";
import { parseCustomConfig, RubySdkCustomConfig } from "./CustomConfig";

export class RubySdkGeneratorCli extends AbstractGeneratorCli<RubySdkCustomConfig> {
    generatedFiles: GeneratedFile[] = [];
    generatedClasses: Map<TypeId, Class_> = new Map();
    flattenedProperties: Map<TypeId, ObjectProperty[]> = new Map();

    protected parseCustomConfig(customConfig: unknown): RubySdkCustomConfig {
        return parseCustomConfig(customConfig);
    }

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
        intermediateRepresentation: IntermediateRepresentation,
        repoUrl?: string
    ) {
        const sdkVersion = getSdkVersion(config);

        const boilerPlateFiles = [];
        boilerPlateFiles.push(generateRubocopConfig());
        boilerPlateFiles.push(generateGemfile());
        boilerPlateFiles.push(
            generateGemspec(
                clientName,
                gemName,
                [],
                sdkVersion,
                config.license,
                hasFileUploadEndpoints(intermediateRepresentation) ||
                    intermediateRepresentation.sdkConfig.hasFileDownloadEndpoints,
                true
            )
        );
        boilerPlateFiles.push(generateGemConfig(clientName, repoUrl));
        // boilerPlateFiles.push(...generateBinDir(gemName));
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
        const generatedTypes = new TypesGenerator(gemName, clientName, generatorContext, intermediateRepresentation);
        this.generatedFiles.push(...Array.from(generatedTypes.generateFiles().values()));
        this.generatedClasses = generatedTypes.getResolvedClasses();
        this.flattenedProperties = generatedTypes.flattenedProperties;
    }

    private generateClients(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ) {
        const sdkVersion = getSdkVersion(config);
        const generatedClientFiles = new ClientsGenerator(
            gemName,
            clientName,
            generatorContext,
            intermediateRepresentation,
            sdkVersion,
            this.generatedClasses,
            this.flattenedProperties,
            hasFileUploadEndpoints(intermediateRepresentation) ||
                intermediateRepresentation.sdkConfig.hasFileDownloadEndpoints
        ).generateFiles();
        this.generatedFiles.push(...Array.from(generatedClientFiles.values()));
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
        this.generateRubyBoilerPlate(gemName, clientName, config, intermediateRepresentation, repoUrl);
        generatorContext.logger.debug("Generating types");
        this.generateTypes(gemName, clientName, generatorContext, intermediateRepresentation);
        generatorContext.logger.debug("Generating clients");
        this.generateClients(gemName, clientName, config, generatorContext, intermediateRepresentation);
    }

    protected async publishPackage(
        _config: FernGeneratorExec.GeneratorConfig,
        _customConfig: RubySdkCustomConfig,
        _generatorContext: AbstractGeneratorContext,
        _intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Unimplemented Exception");
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfig,
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
        customConfig: RubySdkCustomConfig,
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
