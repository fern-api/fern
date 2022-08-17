import { AbsoluteFilePath } from "@fern-api/core-utils";
import { writeFile } from "fs/promises";
import path from "path";
import { loadProject } from "../utils/load-project/loadProject";
import { generateIrForWorkspace } from "./generateIrForWorkspace";

export async function generateIrForWorkspaces({
    commandLineWorkspaces,
    irFilepath,
}: {
    commandLineWorkspaces: readonly string[];
    irFilepath: AbsoluteFilePath | undefined;
}): Promise<void> {
    const { workspaces } = await loadProject({ commandLineWorkspaces });

    await Promise.all(
        workspaces.map(async (workspace) => {
            const intermediateRepresentation = await generateIrForWorkspace({ workspace });
            if (irFilepath != null) {
                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, JSON.stringify(intermediateRepresentation, undefined, 4));
                console.log(`Wrote IR to ${irOutputFilePath}`);
            }
        })
    );
}
