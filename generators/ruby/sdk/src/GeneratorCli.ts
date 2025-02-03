import { cp } from "fs/promises";

import { AbstractGeneratorContext, getPackageName, getSdkVersion } from "@fern-api/base-generator";
import { TypesGenerator } from "@fern-api/fern-ruby-model";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import {
    ClassReferenceFactory,
    Class_,
    ExternalDependency,
    GeneratedFile,
    LocationGenerator,
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
import { IntermediateRepresentation, ObjectProperty, TypeId } from "@fern-fern/ir-sdk/api";

import { ClientsGenerator } from "./ClientsGenerator";
import { RubySdkCustomConfigConsumed, parseCustomConfig } from "./CustomConfig";

export class RubySdkGeneratorCli extends AbstractGeneratorCli<RubySdkCustomConfigConsumed> {
    generatedFiles: GeneratedFile[] = [];
    generatedClasses: Map<TypeId, Class_> = new Map();
    flattenedProperties: Map<TypeId, ObjectProperty[]> = new Map();
    classReferenceFactory: ClassReferenceFactory | undefined;
    locationGenerator: LocationGenerator | undefined;

    protected parseCustomConfig(customConfig: unknown): RubySdkCustomConfigConsumed {
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

    private hasFileUploadEndpoints(ir: IntermediateRepresentation): boolean {
        return Object.entries(ir.services)
            .flatMap(([_, service]) => service.endpoints)
            .some((endpoint) => {
                return endpoint.requestBody?.type === "fileUpload";
            });
    }

    private generateRubyBoilerPlate(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        intermediateRepresentation: IntermediateRepresentation,
        customConfig: RubySdkCustomConfigConsumed,
        repoUrl?: string
    ) {
        const sdkVersion = getSdkVersion(config);

        const boilerPlateFiles = [];
        boilerPlateFiles.push(generateRubocopConfig());
        boilerPlateFiles.push(
            generateGemfile(ExternalDependency.convertDependencies(customConfig.extraDevDependencies ?? {}))
        );
        boilerPlateFiles.push(
            generateGemspec(
                clientName,
                gemName,
                ExternalDependency.convertDependencies(customConfig.extraDependencies ?? {}),
                sdkVersion,
                config.license,
                this.hasFileUploadEndpoints(intermediateRepresentation) ||
                    intermediateRepresentation.sdkConfig.hasFileDownloadEndpoints,
                true
            )
        );
        boilerPlateFiles.push(generateGemConfig(clientName, repoUrl));
        boilerPlateFiles.push(...generateBasicTests(gemName, clientName));
        boilerPlateFiles.push(generateBasicRakefile());

        this.generatedFiles.push(...boilerPlateFiles);
    }

    private generateTypes(
        gemName: string,
        clientName: string,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        customConfig: RubySdkCustomConfigConsumed
    ) {
        const generatedTypes = new TypesGenerator({
            gemName,
            clientName,
            generatorContext,
            intermediateRepresentation,
            shouldFlattenModules: customConfig.flattenModuleStructure
        });
        this.generatedFiles.push(...Array.from(generatedTypes.generateFiles().values()));
        this.generatedClasses = generatedTypes.getResolvedClasses();
        this.flattenedProperties = generatedTypes.flattenedProperties;
        this.locationGenerator = generatedTypes.locationGenerator;
        this.classReferenceFactory = generatedTypes.classReferenceFactory;
    }

    private generateClients(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        customConfig: RubySdkCustomConfigConsumed
    ) {
        const sdkVersion = getSdkVersion(config);
        const generatedClientFiles = new ClientsGenerator({
            gemName,
            clientName,
            generatorContext,
            intermediateRepresentation,
            sdkVersion,
            generatedClasses: this.generatedClasses,
            flattenedProperties: this.flattenedProperties,
            hasFileBasedDependencies:
                this.hasFileUploadEndpoints(intermediateRepresentation) ||
                intermediateRepresentation.sdkConfig.hasFileDownloadEndpoints,
            locationGenerator: this.locationGenerator,
            classReferenceFactory: this.classReferenceFactory,
            shouldFlattenModules: customConfig.flattenModuleStructure
        }).generateFiles();
        this.generatedFiles.push(...Array.from(generatedClientFiles.values()));
    }

    private generateProject(
        gemName: string,
        clientName: string,
        config: FernGeneratorExec.GeneratorConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        customConfig: RubySdkCustomConfigConsumed,
        repoUrl?: string
    ) {
        generatorContext.logger.debug("Generating Ruby project boilerplate.");
        this.generateRubyBoilerPlate(gemName, clientName, config, intermediateRepresentation, customConfig, repoUrl);
        generatorContext.logger.debug("Generating Ruby classes.");
        this.generateTypes(gemName, clientName, generatorContext, intermediateRepresentation, customConfig);
        generatorContext.logger.debug("Generating HTTP client classes.");
        this.generateClients(gemName, clientName, config, generatorContext, intermediateRepresentation, customConfig);
    }

    protected async publishPackage(
        _config: FernGeneratorExec.GeneratorConfig,
        _customConfig: RubySdkCustomConfigConsumed,
        _generatorContext: AbstractGeneratorContext,
        _intermediateRepresentation: IntermediateRepresentation
    ): Promise<void> {
        throw new Error("Unimplemented Exception");
    }
    protected async writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfigConsumed,
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
        generatorContext.logger.debug("Generating repository boilerplate.");
        this.generateRepositoryBoilerPlate(gemName, githubOutputMode);
        generatorContext.logger.debug("Generating Ruby project.");
        this.generateProject(
            gemName,
            clientName,
            config,
            generatorContext,
            intermediateRepresentation,
            customConfig,
            githubOutputMode.repoUrl
        );

        generatorContext.logger.debug("Writing files to disk.");
        const outputDir = AbsoluteFilePath.of("/fern/ruby_output");
        for (const file of this.generatedFiles) {
            generatorContext.logger.debug(`Writing file ${file.filename}.`);
            await file.write(AbsoluteFilePath.of(outputDir));
            generatorContext.logger.debug("Finished writing file.");
        }
        generatorContext.logger.debug("Done writing files to disk.");
        // Run lint and generate lockfile
        try {
            generatorContext.logger.debug("Running linting and formatting via Rubocop.");
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
            generatorContext.logger.debug("Could not run linting, step skipped.");
        }

        generatorContext.logger.debug("Copying files to output directory.");
        await cp(outputDir, AbsoluteFilePath.of(config.output.path), { recursive: true });
        generatorContext.logger.debug("Done copying files to output directory.");

        return;
    }
    protected async writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: RubySdkCustomConfigConsumed,
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
        generatorContext.logger.debug("Generating Ruby project.");
        this.generateProject(gemName, clientName, config, generatorContext, intermediateRepresentation, customConfig);

        generatorContext.logger.debug("Writing files to disk.");
        const outputDir = AbsoluteFilePath.of("/fern/ruby_output");
        for (const file of this.generatedFiles) {
            await file.write(AbsoluteFilePath.of(outputDir));
        }
        generatorContext.logger.debug("Done writing files to disk.");
        // Run lint and generate lockfile
        try {
            generatorContext.logger.debug("Running linting and formatting via Rubocop.");
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
            generatorContext.logger.debug("Could not run linting, step skipped.");
        }
        generatorContext.logger.debug("Copying files to output directory.");
        await cp(outputDir, AbsoluteFilePath.of(config.output.path), { recursive: true });
        generatorContext.logger.debug("Done copying files to output directory.");

        return;
    }
}
