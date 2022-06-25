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
        const command = execa("npm", args, {
            cwd: outputPath,
        });
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    }

    if (config.publish != null) {
        const { registryUrl, token } = config.publish.registries.npm;
        await runNpmCommandInOutputDirectory(
            "config",
            "set",
            `${scopeWithAtSign}:registry`,
            registryUrl
        );
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
    }
}
