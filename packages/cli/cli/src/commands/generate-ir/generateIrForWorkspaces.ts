import { loadWorkspaceDefinition } from "@fern-api/commons";
import { writeFile } from "fs/promises";
import path from "path";
import { loadProjectAndWorkspaces } from "../utils/loadProjectAndWorkspaces";
import { generateIrForWorkspace } from "./generateIrForWorkspace";

export async function generateIrForWorkspaces({
    commandLineWorkspaces,
    irFilepath,
}: {
    commandLineWorkspaces: readonly string[];
    irFilepath: string | undefined;
}): Promise<void> {
    const { workspacePaths } = await loadProjectAndWorkspaces({ commandLineWorkspaces });

    await Promise.all(
        workspacePaths.map(async (workspacePath) => {
            const workspaceDefinition = await loadWorkspaceDefinition(workspacePath);
            const intermediateRepresentation = await generateIrForWorkspace({
                workspaceDefinition,
            });
            if (irFilepath != null) {
                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, JSON.stringify(intermediateRepresentation, undefined, 4));
                console.log(`Wrote IR to ${irOutputFilePath}`);
            }
        })
    );
}
