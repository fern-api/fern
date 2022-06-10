import { GeneratorConfig } from "@fern-api/generator-runner";
import { withProject, writeFiles } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
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

    const project = await withProject(async (p) => {
        await command.run({
            project: p,
            intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
            helperManager: new HelperManager(config.helpers),
        });
    });

    await writeFiles(config.output.path, project);
}
