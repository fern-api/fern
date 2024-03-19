import { File, packageUtils } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorContext, getPackageName as getPackageNameFromPublishConfig } from "@fern-api/generator-commons";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { createLoggingExecutable } from "@fern-api/logging-execa";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { cp, readdir, readFile } from "fs/promises";
import { template } from "lodash";
import tmp from "tmp-promise";
import { BaseCustomConfigSchema } from "./BaseCustomConfig";
import { GeneratorNotificationServiceImpl } from "./GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

export abstract class AbstractGeneratorCli<CustomConfig extends BaseCustomConfigSchema> {
    public asIsRootDirectory = AbsoluteFilePath.of("/asIs");

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
                throw new Error("Failed to generate csharp project.");
            }

            const intermediateRepresentation = await loadIntermediateRepresentation(config.irFilepath);

            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await this.publishPackage(config, customConfig, generatorContext, intermediateRepresentation);
                },
                github: async (githubOutputMode: FernGeneratorExec.GithubOutputMode) => {
                    await this.writeForGithub(
                        config,
                        customConfig,
                        generatorContext,
                        intermediateRepresentation,
                        githubOutputMode
                    );
                },
                downloadFiles: async () => {
                    await this.writeForDownload(config, customConfig, generatorContext, intermediateRepresentation);
                },
                _other: ({ type }) => {
                    throw new Error(`${type} mode is not implemented`);
                }
            });

            // ===== Universal tasks across model and SDK generators =====

            // TODO: should probably also write tests here.
            const packageName = packageUtils.getPackageName(
                config.organization,
                intermediateRepresentation.apiName.pascalCase.safeName,
                customConfig.clientClassName,
                getPackageNameFromPublishConfig(config)
            );
            await this.writeProjectFiles(config, packageName);
            this.formatFiles(config);

            // ===========================================================

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

    protected abstract parseCustomConfig(customConfig: unknown): CustomConfig;

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

    formatFiles(config: FernGeneratorExec.GeneratorConfig): void {
        // Run lint
        try {
            execSync(`dotnet format ${config.output.path}`);
        } catch {
            // NOOP, ignore warns
        }
    }

    async writeProjectFiles(config: FernGeneratorExec.GeneratorConfig, projectName: string): Promise<void> {
        const directoryPrefix = join(AbsoluteFilePath.of(config.output.path), RelativeFilePath.of("src"));
        if (!existsSync(directoryPrefix)) {
            return;
        }

        // Create a new solution
        execSync(`cd ${directoryPrefix} && dotnet new sln -n ${projectName}`);

        // Create and add the core project
        const csprojContents = await readFile(
            join(this.asIsRootDirectory, RelativeFilePath.of("./cli/Template.csproj")),
            "utf8"
        );
        await new File(`${projectName}.csproj`, RelativeFilePath.of(projectName), csprojContents).write(
            directoryPrefix
        );
        execSync(`cd ${directoryPrefix} && dotnet sln add ./${projectName}/${projectName}.csproj`);

        // Create and add the test project
        const testCsprojContents = template(
            await readFile(join(this.asIsRootDirectory, RelativeFilePath.of("./cli/Template.Test.csproj")), "utf8")
        )({ projectName });
        const testProjectName = `${projectName}.Test`;
        await new File(`${testProjectName}.csproj`, RelativeFilePath.of(testProjectName), testCsprojContents).write(
            directoryPrefix
        );
        execSync(`cd ${directoryPrefix} && dotnet sln add ./${testProjectName}/${testProjectName}.csproj`);

        // Create the gitignore
        execSync(`cd ${directoryPrefix} && dotnet new gitignore`);
    }

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
