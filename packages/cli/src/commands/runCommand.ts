import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { GeneratorUpdate } from "@fern-fern/generator-exec-client/api/logging";
import { BUILD_PROJECT_SCRIPT_NAME, FernTypescriptGeneratorConfig, writeVolumeToDisk } from "@fern-typescript/commons";
import { createLogger, Logger, LogLevel } from "@fern-typescript/commons-v2";
import { GeneratorContext } from "@fern-typescript/sdk-declaration-handler";
import execa from "execa";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { GeneratorNotificationService } from "../utils/GeneratorNotificationService";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { Command } from "./Command";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error,
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

    await writeVolumeToDisk(volume, AbsoluteFilePath.of(outputPath));

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
        await runNpmCommandInOutputDirectory("install");
        await runNpmCommandInOutputDirectory("run", BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");

        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.published(command.npmPackage.publishInfo.packageCoordinate)
        );
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
