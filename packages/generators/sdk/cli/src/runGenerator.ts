import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { readFile } from "fs/promises";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackage } from "./publishPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { writeGitHubWorkflows } from "./writeGitHubWorkflows";
import { createYarnRunner, YarnRunner } from "./yarnRunner";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error,
};

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const rawConfig = JSON.parse(configStr.toString());
    const config = GeneratorExecParsing.GeneratorConfig.parse(rawConfig);
    const customConfig = parseCustomConfig(config);
    const generatorNotificationService = new GeneratorNotificationService(config);

    try {
        const logger = createLogger((level, ...message) => {
            // eslint-disable-next-line no-console
            console.log(...message);
            // kick off log, but don't wait for it
            void generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.log({
                    message: message.join(" "),
                    level: LOG_LEVEL_CONVERSIONS[level],
                })
            );
        });

        const npmPackage = constructNpmPackage(config);

        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.initV2({
                publishingToRegistry: npmPackage.publishInfo != null ? FernGeneratorExec.RegistryType.Npm : undefined,
            })
        );

        const runYarnCommand = createYarnRunner(logger, AbsoluteFilePath.of(config.output.path));

        const { writtenTo: pathToPackageOnDisk } = await generateFiles({
            config,
            customConfig,
            logger,
            npmPackage,
        });

        await config.output.mode._visit<void | Promise<void>>({
            publish: async () => {
                if (npmPackage.publishInfo == null) {
                    throw new Error("npmPackage.publishInfo is not defined.");
                }
                await upgradeYarnAndInstall({ runYarnCommand });
                await publishPackage({
                    generatorNotificationService,
                    logger,
                    publishInfo: npmPackage.publishInfo,
                    pathToPackageOnDisk,
                    runYarnCommand,
                    dryRun: config.dryRun,
                });
            },
            github: async (githubOutputMode) => {
                await upgradeYarnAndInstall({ runYarnCommand });
                await runYarnCommand(["dlx", "@yarnpkg/sdks", "vscode"]);
                await writeGitHubWorkflows({
                    config,
                    githubOutputMode,
                    customConfig,
                });
            },
            downloadFiles: noop,
            _other: ({ type }) => {
                throw new Error(`${type} mode is not implemented`);
            },
        });

        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful())
        );
    } catch (e) {
        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                FernGeneratorExec.ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
        throw e;
    }
}

function parseCustomConfig(config: FernGeneratorExec.GeneratorConfig): SdkCustomConfig {
    const customConfig = config.customConfig != null ? SdkCustomConfigSchema.parse(config.customConfig) : undefined;
    return {
        useBrandedStringAliases: customConfig?.useBrandedStringAliases ?? false,
        isPackagePrivate: customConfig?.private ?? false,
    };
}

async function upgradeYarnAndInstall({ runYarnCommand }: { runYarnCommand: YarnRunner }) {
    await runYarnCommand(["set", "version", "3.2.4"]);
    await runYarnCommand(["config", "set", "nodeLinker", "pnp"]);
    await runYarnCommand(["install"], {
        env: {
            // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
            YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
        },
    });
}
