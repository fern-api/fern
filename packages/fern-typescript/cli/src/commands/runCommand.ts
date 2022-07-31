import { GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { BUILD_PROJECT_SCRIPT_NAME, FernTypescriptGeneratorConfig, writeVolumeToDisk } from "@fern-typescript/commons";
import execa from "execa";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { GeneratorLoggingWrapper } from "../utils/generatorLoggingWrapper";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { FernTypescriptClientGenerator } from "../v2/client/FernTypescriptClientGenerator";
import { LoggerImpl } from "../v2/client/logger/Logger";
import { DependencyType } from "../v2/generate-ts-project/DependencyManager";
import { generateTypeScriptProject } from "../v2/generate-ts-project/generateTypeScriptProject";
import { Command } from "./Command";

export async function runCommand({
    command,
    config,
    generatorLoggingWrapper,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
    generatorLoggingWrapper: GeneratorLoggingWrapper;
}): Promise<void> {
    const {
        output: { path: baseOutputPath },
    } = config;
    const outputPath = path.join(baseOutputPath, command.key);

    const volume = new Volume();

    const clientGenerator = new FernTypescriptClientGenerator(
        "BlogPostApi",
        await loadIntermediateRepresentation(config.irFilepath),
        new LoggerImpl((message, level) =>
            generatorLoggingWrapper.sendUpdate(
                GeneratorUpdate.log({
                    message,
                    level,
                })
            )
        )
    );

    const project = await clientGenerator.generate();

    await generateTypeScriptProject({
        volume,
        packageName: "blog-post-api",
        packageVersion: "0.0.1",
        project,
        dependencies: {
            [DependencyType.PROD]: {},
            [DependencyType.DEV]: {},
            [DependencyType.PEER]: {},
        },
    });

    await writeVolumeToDisk(volume, outputPath);

    if (command.npmPackage.publishInfo != null) {
        const runNpmCommandInOutputDirectory = async (...args: string[]): Promise<void> => {
            const command = execa("npm", args, {
                cwd: outputPath,
            });
            command.stdout?.pipe(process.stdout);
            command.stderr?.pipe(process.stderr);
            await command;
        };

        await generatorLoggingWrapper.sendUpdate(
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

        await generatorLoggingWrapper.sendUpdate(
            GeneratorUpdate.published(command.npmPackage.publishInfo.packageCoordinate)
        );
    }
}
