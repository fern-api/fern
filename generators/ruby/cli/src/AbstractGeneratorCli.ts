import { cp, readdir } from "fs/promises";
import tmp from "tmp-promise";

import {
    AbstractGeneratorContext,
    FernGeneratorExec,
    GeneratorNotificationService,
    parseGeneratorConfig
} from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";

export abstract class AbstractGeneratorCli<CustomConfig> {
    public async runCli(): Promise<void> {
        const pathToConfig = process.argv[process.argv.length - 1];
        if (pathToConfig == null) {
            throw new Error("No argument for config filepath.");
        }
        await this.run(pathToConfig);
    }

    public async run(pathToConfig: string): Promise<void> {
        const config = await parseGeneratorConfig(pathToConfig);
        const generatorNotificationService = new GeneratorNotificationService(config.environment);

        try {
            const generatorContext = new GeneratorContextImpl(config, generatorNotificationService);
            generatorContext.logger.debug("[Ruby] Beginning generator-specific logic.");
            const customConfig = this.parseCustomConfig(config.customConfig);
            generatorContext.logger.debug("[Ruby] Custom configuration has been parsed, beginning core execution.");

            if (!generatorContext.didSucceed()) {
                throw new Error("Failed to generate ruby project.");
            }

            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    generatorContext.logger.debug("[Ruby] Entering `publish` generation flow.");
                    await this.publishPackage(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath)
                    );
                },
                github: async (githubOutputMode: FernGeneratorExec.GithubOutputMode) => {
                    generatorContext.logger.debug("[Ruby] Entering `github` generation flow.");
                    await this.writeForGithub(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath),
                        githubOutputMode
                    );
                },
                downloadFiles: async () => {
                    generatorContext.logger.debug("[Ruby] Entering `downloadFiles` generation flow.");
                    await this.writeForDownload(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath)
                    );
                },
                _other: ({ type }) => {
                    throw new Error(`${type} mode is not implemented`);
                }
            });

            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful({}))
            );
        } catch (e) {
            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error"
                    })
                )
            );
            throw e;
        }
    }

    // 0. Parse any custom config and forward to generator
    protected abstract parseCustomConfig(customConfig: unknown): CustomConfig;
    // 1. Generate the project
    // 2. Add additional files (tests, GitHub files (workflow files, .gitignore, etc.))
    // 3. Set up package and publishing
    // Write necessary files for publishing and return any necessary package information
    // + actually publish the specified package
    protected abstract publishPackage(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void>;
    protected abstract writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void>;
    protected abstract writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: AbstractGeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void>;

    async zipDirectoryContents({
        directoryToZip,
        destinationZip,
        logger
    }: {
        directoryToZip: AbsoluteFilePath;
        destinationZip: AbsoluteFilePath;
        logger: Logger;
    }): Promise<void> {
        const zip = createLoggingExecutable("zip", {
            cwd: directoryToZip,
            logger,
            // zip is noisy
            doNotPipeOutput: true
        });

        const tmpZipLocation = join(AbsoluteFilePath.of((await tmp.dir()).path), RelativeFilePath.of("output.zip"));
        await zip(["-r", tmpZipLocation, ...(await readdir(directoryToZip))]);
        await cp(tmpZipLocation, destinationZip);
    }
}

class GeneratorContextImpl extends AbstractGeneratorContext {
    private isSuccess = true;

    constructor(
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
    }

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
