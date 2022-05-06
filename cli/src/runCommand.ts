import { withProject, writeFiles } from "@fern-typescript/commons";
import { Command } from "./Command";
import { loadIntermediateRepresentation } from "./commands/utils/loadIntermediateRepresentation";

export async function runCommand({
    command,
    pathToIr,
    outputDir,
}: {
    command: Command;
    pathToIr: string;
    outputDir: string;
}): Promise<void> {
    const intermediateRepresentation = await loadIntermediateRepresentation(pathToIr);

    const project = withProject((p) => {
        command.run({
            project: p,
            intermediateRepresentation,
        });
    });

    await writeFiles(outputDir, project);
}
