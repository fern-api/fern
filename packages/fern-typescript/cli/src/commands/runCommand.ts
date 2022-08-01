import { GeneratorUpdate, LogLevel } from "@fern-fern/generator-logging-api-client/model";
import { BUILD_PROJECT_SCRIPT_NAME, FernTypescriptGeneratorConfig, writeVolumeToDisk } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import execa from "execa";
import camelCase from "lodash-es/camelCase";
import upperFirst from "lodash-es/upperFirst";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { GeneratorNotificationService } from "../utils/GeneratorNotificationService";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { AsyncLogger } from "../v2/client/logger/AsyncLogger";
import { Command } from "./Command";

const CONSOLE_LOGGERS: Record<LogLevel, (message: string) => void> = {
    [LogLevel.Debug]: console.debug,
    [LogLevel.Info]: console.info,
    [LogLevel.Warn]: console.warn,
    [LogLevel.Error]: console.error,
};

export async function runCommand({
    command,
    config,
    generatorNotificationService,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
    generatorNotificationService: GeneratorNotificationService;
}): Promise<void> {
    const {
        output: { path: baseOutputPath },
    } = config;
    const outputPath = path.join(baseOutputPath, command.key);

    const logger = new AsyncLogger(async (message, level) => {
        CONSOLE_LOGGERS[level](message);
        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.log({
                message,
                level,
            })
        );
    });

    const volume = new Volume();
    await command.generate({
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        apiName: upperCamelCase(config.workspaceName),
        helperManager: new HelperManager(config.helpers),
        volume,
        logger,
    });

    await writeVolumeToDisk(volume, outputPath);
    await logger.waitForLogsToHaveSent();

    if (command.npmPackage.publishInfo != null) {
        const runNpmCommandInOutputDirectory = async (...args: string[]): Promise<void> => {
            const command = execa("npm", args, {
                cwd: outputPath,
            });
            command.stdout?.pipe(process.stdout);
            command.stderr?.pipe(process.stderr);
            await command;
        };

        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.publishing(command.npmPackage.publishInfo.packageCoordinate)
        );

        const { registryUrl, token } = command.npmPackage.publishInfo.registry;
        await runNpmCommandInOutputDirectory(
            "config",
            "set",
            `${command.npmPackage.scopeWithAtSign}:registry`,
            registryUrl,
            "--location",
            "project"
        );
        const parsedRegistryUrl = new URL(registryUrl);
        await runNpmCommandInOutputDirectory(
            "config",
            "set",
            `//${path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname)}:_authToken`,
            token
            // intentionally not writing this to the project config, so the token isn't persisted
        );
        await runNpmCommandInOutputDirectory("install", "--no-save");
        await runNpmCommandInOutputDirectory("run", BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");

        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.published(command.npmPackage.publishInfo.packageCoordinate)
        );
    }
}

function upperCamelCase(str: string): string {
    return upperFirst(camelCase(str));
}
