import { BUILD_PROJECT_SCRIPT_NAME, writeVolumeToDisk } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import execa from "execa";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { FernTypescriptGeneratorConfig } from "../generator/FernGeneratorConfig";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { Command } from "./Command";

export async function runCommand({
    command,
    config,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
}): Promise<void> {
    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }
    const {
        output: { path: baseOutputPath },
    } = config;
    const outputPath = path.join(baseOutputPath, command.key);

    const volume = new Volume();

    const scopeWithAtSign = `@${config.organization}`;

    await command.generate({
        packageName: `${scopeWithAtSign}/${config.workspaceName}-${command.key}`,
        packageVersion: config.publish?.version,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        helperManager: new HelperManager(config.helpers),
        volume,
    });

    await writeVolumeToDisk(volume, outputPath);

    async function runNpmCommandInOutputDirectory(...args: string[]): Promise<void> {
        await execa("npm", args, {
            cwd: outputPath,
        });
    }

    if (config.publish != null) {
        await runNpmCommandInOutputDirectory(
            "config",
            "set",
            `${scopeWithAtSign}:${config.publish.registries.npm.registryUrl}`,
            config.publish.registries.npm.registryUrl
        );
        await runNpmCommandInOutputDirectory("install", "--no-save");
        await runNpmCommandInOutputDirectory(BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");
    }
}
