import { loadProject } from "../utils/load-project/loadProject";
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
    const { projectConfig, workspaceConfigurations } = await loadProject({
        commandLineWorkspaces,
    });

    await Promise.all(
        workspaceConfigurations.map((workspaceConfigurationFilePath) =>
            generateWorkspace({
                absolutePathToWorkspaceConfiguration: workspaceConfigurationFilePath,
                runLocal,
                keepDocker,
                organization: projectConfig.organization,
            })
        )
    );
}
