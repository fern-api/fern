import { PluginConfig } from "@fern-api/plugin-runner";
import { withProject, writeFiles } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { Command } from "./Command";
import { loadIntermediateRepresentation } from "./commands/utils/loadIntermediateRepresentation";
import { TypescriptPluginConfigSchema } from "./plugin/plugin-config/schemas/TypescriptPluginConfigSchema";

export async function runCommand({
    command,
    config,
}: {
    command: Command;
    config: PluginConfig<TypescriptPluginConfigSchema>;
}): Promise<void> {
    if (config.output == null) {
        throw new Error("Output directory is not specified.");
    }

    const project = await withProject(async (p) => {
        command.run({
            project: p,
            intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
            helperManager: new HelperManager(config.helpers),
        });
    });

    await writeFiles(config.output.path, project);
}
