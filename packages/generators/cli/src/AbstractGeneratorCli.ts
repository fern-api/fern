import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext, PersistedProject } from "@fern-api/generator-commons";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { readFile } from "fs/promises";
import { GeneratorNotificationServiceImpl } from "./GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";

const OUTPUT_ZIP_FILENAME = "output.zip";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

export abstract class AbstractGeneratorCli<CustomConfig> {
    // TODO(fern-api): Dependent on update to Fiddle def: https://github.com/fern-api/fiddle/blob/main/fern/apis/generator-exec/definition/logging.yml#L26
    // private registry: FernGeneratorExec.RegistryType;
    // constructor(registry: FernGeneratorExec.RegistryType) {
    //     this.registry = registry;
    // }

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

            const destinationZip = join(
                AbsoluteFilePath.of(config.output.path),
                RelativeFilePath.of(OUTPUT_ZIP_FILENAME)
            );
            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await this.publishPackage(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath),
                        destinationZip
                    );
                },
                github: async (githubOutputMode) => {
                    await this.writeForGithub(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath),
                        destinationZip,
                        githubOutputMode
                    );
                },
                downloadFiles: async () => {
                    await this.writeForDownload(
                        config,
                        customConfig,
                        generatorContext,
                        await loadIntermediateRepresentation(config.irFilepath),
                        destinationZip
                    );
                },
                _other: ({ type }) => {
                    throw new Error(`${type} mode is not implemented`);
                }
            });

            await generatorNotificationService?.sendUpdateOrThrow(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.successful({
                        zipFilename: OUTPUT_ZIP_FILENAME
                    })
                )
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
        intermediateRepresentation: IntermediateRepresentation,
        destination: AbsoluteFilePath
    ): Promise<void>;
    protected abstract writeForGithub(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        destination: AbsoluteFilePath,
        githubOutputMode: FernGeneratorExec.GithubOutputMode
    ): Promise<void>;
    protected abstract writeForDownload(
        config: FernGeneratorExec.GeneratorConfig,
        customConfig: CustomConfig,
        generatorContext: GeneratorContext,
        intermediateRepresentation: IntermediateRepresentation,
        destination: AbsoluteFilePath
    ): Promise<void>;
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
