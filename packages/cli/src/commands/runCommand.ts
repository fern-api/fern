import { model as GeneratorLoggingApiModel } from "@fern-fern/generator-logging-api-client";
import { GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { BUILD_PROJECT_SCRIPT_NAME, FernTypescriptGeneratorConfig, writeVolumeToDisk } from "@fern-typescript/commons";
import { createLogger, LogLevel } from "@fern-typescript/commons-v2";
import execa from "execa";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { GeneratorNotificationService } from "../utils/GeneratorNotificationService";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { GeneratorContextImpl } from "../v2/generator-context/GeneratorContextImpl";
import { Command } from "./Command";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, GeneratorLoggingApiModel.LogLevel> = {
    [LogLevel.Debug]: GeneratorLoggingApiModel.LogLevel.Debug,
    [LogLevel.Info]: GeneratorLoggingApiModel.LogLevel.Info,
    [LogLevel.Warn]: GeneratorLoggingApiModel.LogLevel.Warn,
    [LogLevel.Error]: GeneratorLoggingApiModel.LogLevel.Error,
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

    const generatorContext = new GeneratorContextImpl(
        createLogger((message, level) => {
            // kick off log, but don't wait for it
            void generatorNotificationService.sendUpdate(
                GeneratorUpdate.log({
                    message,
                    level: LOG_LEVEL_CONVERSIONS[level],
                })
            );
        })
    );

    const volume = new Volume();
    await command.generate({
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        apiName: upperFirst(camelCase(config.workspaceName)),
        volume,
        context: generatorContext,
    });

    await writeVolumeToDisk(volume, outputPath);

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    if (command.npmPackage.publishInfo != null) {
        const runCommandInOutputDirectory = async (executable: string, ...args: string[]): Promise<void> => {
            const command = execa(executable, args, {
                cwd: outputPath,
            });
            command.stdout?.pipe(process.stdout);
            command.stderr?.pipe(process.stderr);
            await command;
        };

        const runNpmCommandInOutputDirectory = async (...args: string[]): Promise<void> => {
            await runCommandInOutputDirectory("npm", ...args);
        };

        const runBunCommandInOutputDirectory = async (...args: string[]): Promise<void> => {
            await runCommandInOutputDirectory("bun", ...args);
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
        await runBunCommandInOutputDirectory("install");
        await runBunCommandInOutputDirectory("run", BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");

        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.published(command.npmPackage.publishInfo.packageCoordinate)
        );
    }
}
