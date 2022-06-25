import { GeneratorConfig } from "@fern-api/generator-runner";
import { BUILD_PROJECT_SCRIPT_NAME, writeVolumeToDisk } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import execa from "execa";
import { Volume } from "memfs/lib/volume";
import path from "path";
import { TypescriptGeneratorConfigSchema } from "../generator/generator-config/schemas/TypescriptGeneratorConfigSchema";
import { loadIntermediateRepresentation } from "../utils/loadIntermediateRepresentation";
import { Command } from "./Command";

export async function runCommand({
    command,
    config,
}: {
    command: Command<string>;
    config: GeneratorConfig<TypescriptGeneratorConfigSchema>;
}): Promise<void> {
    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }
    const {
        output: { path: baseOutputPath },
    } = config;
    const outputPath = path.join(baseOutputPath, command.key);

    const volume = new Volume();

    await command.generate({
        packageName: config.customConfig.packageName,
        packageVersion: config.workspaceVersion,
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
            `@${config.publish.registries.npm.scope}:${config.publish.registries.npm.scope}`,
            config.publish.registryUrl
        );
        await runNpmCommandInOutputDirectory("install", "--no-save");
        await runNpmCommandInOutputDirectory(BUILD_PROJECT_SCRIPT_NAME);
        await runNpmCommandInOutputDirectory("publish");
    }
}
