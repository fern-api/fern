import { AbsoluteFilePath } from "@fern-api/core-utils";
import { writeFile } from "fs/promises";
import path from "path";
import { Project } from "../../createProjectLoader";
import { generateIrForWorkspace } from "./generateIrForWorkspace";

export async function generateIrForWorkspaces({
    project,
    irFilepath,
}: {
    project: Project;
    irFilepath: AbsoluteFilePath | undefined;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            const intermediateRepresentation = await generateIrForWorkspace({ workspace });
            if (irFilepath != null) {
                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, JSON.stringify(intermediateRepresentation, undefined, 4));
                console.log(`Wrote IR to ${irOutputFilePath}`);
            }
        })
    );
}
