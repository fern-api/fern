import { loadProject } from "../utils/load-project/loadProject";
import { parseAndValidateWorkspace } from "./validateWorkspace";

export async function validateWorkspaces({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<void> {
    const { workspaceConfigurations } = await loadProject({
        commandLineWorkspaces,
    });

    await Promise.all(
        workspaceConfigurations.map((workspaceConfigurationFilePath) =>
            parseAndValidateWorkspace({
                absolutePathToWorkspaceConfiguration: workspaceConfigurationFilePath,
            })
        )
    );
}
