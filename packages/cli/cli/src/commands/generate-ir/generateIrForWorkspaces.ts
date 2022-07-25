import { loadWorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { writeFile } from "fs/promises";
import path from "path";
import { loadProject } from "../utils/load-project/loadProject";
import { generateIrForWorkspace } from "./generateIrForWorkspace";

export async function generateIrForWorkspaces({
    commandLineWorkspaces,
    irFilepath,
}: {
    commandLineWorkspaces: readonly string[];
    irFilepath: string | undefined;
}): Promise<void> {
    const { workspaceConfigurations } = await loadProject({ commandLineWorkspaces });

    await Promise.all(
        workspaceConfigurations.map(async (workspaceConfigurationFilePath) => {
            const workspaceConfiguration = await loadWorkspaceConfiguration(workspaceConfigurationFilePath);
            const intermediateRepresentation = await generateIrForWorkspace({
                workspaceConfiguration,
            });
            if (irFilepath != null) {
                const irOutputFilePath = path.resolve(irFilepath);
                await writeFile(irOutputFilePath, JSON.stringify(intermediateRepresentation, undefined, 4));
                console.log(`Wrote IR to ${irOutputFilePath}`);
            }
        })
    );
}
