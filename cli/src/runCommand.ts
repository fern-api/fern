import { GeneratorConfig } from "@fern-api/generator-runner";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Volume } from "memfs/lib/volume";
import { Command } from "./Command";
import { loadIntermediateRepresentation } from "./commands/utils/loadIntermediateRepresentation";
import { TypescriptGeneratorConfigSchema } from "./generator/generator-config/schemas/TypescriptGeneratorConfigSchema";

export async function runCommand({
    command,
    config,
}: {
    command: Command;
    config: GeneratorConfig<TypescriptGeneratorConfigSchema>;
}): Promise<void> {
    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }
    const {
        output: { path: outputPath },
    } = config;

    const volume = new Volume();

    await command.run({
        packageName: config.customConfig.packageName,
        packageVersion: config.workspaceVersion,
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        helperManager: new HelperManager(config.helpers),
        volume,
    });

    await writeVolumeToDisk(volume, outputPath);
}
