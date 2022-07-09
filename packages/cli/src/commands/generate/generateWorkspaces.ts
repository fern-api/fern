import { loadProjectAndWorkspaces } from "../utils/loadProjectAndWorkspaces";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    commandLineWorkspaces,
    runLocal,
    keepDocker,
}: {
    commandLineWorkspaces: readonly string[];
    runLocal: boolean;
    keepDocker: boolean;
}): Promise<void> {
    const { projectConfig, workspacePaths } = await loadProjectAndWorkspaces({
        commandLineWorkspaces,
    });

    await Promise.all(
        workspacePaths.map((uniqueWorkspaceDefinitionPath) =>
            generateWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
                runLocal,
                keepDocker,
                organization: projectConfig.organization,
            })
        )
    );
}
