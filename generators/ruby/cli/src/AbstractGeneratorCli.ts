import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext } from "@fern-api/generator-commons";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { cp, readdir, readFile } from "fs/promises";
import tmp from "tmp-promise";
import { GeneratorNotificationServiceImpl } from "./GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

export abstract class AbstractGeneratorCli<CustomConfig> {
    public async runCli(): Promise<void> {
        const pathToConfig = process.argv[process.argv.length - 1];
        if (pathToConfig == null) {
            throw new Error("No argument for config filepath.");
        }
        await this.run(pathToConfig);
    }

    public async run(pathToConfig: string): Promise<void> {
        const configStr = await readFile(pathToConfig);
        const rawConfig = JSON.parse(configStr.toString());
        const config = await GeneratorExecParsing.GeneratorConfig.parseOrThrow(
            {
                ...rawConfig,
                // in this version of the fiddle client, it requires unknown
                // properties to be present
                customConfig: rawConfig.customConfig ?? {}
            },
            {
                unrecognizedObjectKeys: "passthrough"
            }
        );
        const generatorNotificationService =
            config.environment.type === "remote" ? new GeneratorNotificationServiceImpl(config.environment) : undefined;

        try {
            const customConfig = this.parseCustomConfig(config.customConfig);

            const logger = createLogger((level, ...message) => {
                CONSOLE_LOGGER.log(level, ...message);

                // kick off log, but don't wait for it
                void generatorNotificationService?.sendUpdateAndSwallowError(
                    FernGeneratorExec.GeneratorUpdate.log({
                        message: message.join(" "),
                        level: LOG_LEVEL_CONVERSIONS[level]
                    })
                );
            });

            // TODO(fern-api): Dependent on update to Fiddle def: https://github.com/fern-api/fiddle/blob/main/fern/apis/generator-exec/definition/logging.yml#L26
            // await generatorNotificationService?.sendUpdateOrThrow(
            //     FernGeneratorExec.GeneratorUpdate.initV2({
            //         publishingToRegistry: config.output.mode._visit<FernGeneratorExec.RegistryType | undefined>({
            //             publish: () => this.registry,
            //             github: () => undefined,
            //             downloadFiles: () => undefined,
            //             _other: () => undefined,
            //         })
            //     })
            // );

            const generatorContext = new GeneratorContextImpl(logger);
            if (!generatorContext.didSucceed()) {
                throw new Error("Failed to generate TypeScript project.");
            }

            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await this.publishPackage(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath)
                    );
                },
                github: async (githubOutputMode: FernGeneratorExec.GithubOutputMode) => {
                    await this.writeForGithub(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath),
                        githubOutputMode
                    );
                },
                downloadFiles: async () => {
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

            await generatorNotificationService?.sendUpdateOrThrow(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful({}))
            );
        } catch (e) {
            await generatorNotificationService?.sendUpdateOrThrow(
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
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation
    ): Promise<void>;
    protected abstract writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void>;
    protected abstract writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: GeneratorContext,
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

class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(public readonly logger: Logger) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
