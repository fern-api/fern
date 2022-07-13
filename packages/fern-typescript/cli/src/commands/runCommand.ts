import { GeneratorUpdate } from "@fern-fern/generator-logging-api-client/model";
import { BUILD_PROJECT_SCRIPT_NAME, writeVolumeToDisk } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import execa from "execa";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { FernTypescriptGeneratorConfig } from "../generator/FernGeneratorConfig";
import { GeneratorLoggingWrapper } from "../utils/generatorLoggingWrapper";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { Command } from "./Command";
import { NpmPackage } from "./getCommandPackageCoordinate";

export async function runCommand({
    command,
    config,
    npmPackage,
    generatorLoggingWrapper,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
    npmPackage: NpmPackage;
    generatorLoggingWrapper: GeneratorLoggingWrapper;
}): Promise<void> {
    const {
        output: { path: baseOutputPath },
    } = config;
    const outputPath = path.join(baseOutputPath, command.key);

    const volume = new Volume();

    const scopeWithAtSign = `@${npmPackage.scope}`;

    await command.generate({
        fullPackageName: npmPackage.fullPackageName,
        packageVersion: npmPackage.packageCoordinate?.version,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        helperManager: new HelperManager(config.helpers),
        volume,
    });

    await writeVolumeToDisk(volume, outputPath);

    async function runNpmCommandInOutputDirectory(...args: string[]): Promise<void> {
        const command = execa("npm", args, {
            cwd: outputPath,
        });
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    }

    if (config.publish != null && npmPackage.packageCoordinate != null) {
        await generatorLoggingWrapper.sendUpdate(GeneratorUpdate.publishing(npmPackage.packageCoordinate));

        const { registryUrl, token } = config.publish.registries.npm;
        await runNpmCommandInOutputDirectory("config", "set", `${scopeWithAtSign}:registry`, registryUrl);
        const parsedRegistryUrl = new URL(registryUrl);
        await runNpmCommandInOutputDirectory(
            "config",
            "set",
            `//${path.join(parsedRegistryUrl.hostname, parsedRegistryUrl.pathname)}:_authToken`,
            token
        );
        await runNpmCommandInOutputDirectory("install", "--no-save");
        await runNpmCommandInOutputDirectory("run", BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");

        await generatorLoggingWrapper.sendUpdate(GeneratorUpdate.published(npmPackage.packageCoordinate));
    }
}
