import { loadProjectConfig, ProjectConfig } from "@fern-api/project-configuration";
import { getWorkspaceConfigurationPaths } from "./getWorkspaceConfigurationPaths";
import { WorkspaceConfigurationFilePath } from "./WorkspaceConfigurationFilePath";

export interface Project {
    projectConfig: ProjectConfig;
    workspaceConfigurations: WorkspaceConfigurationFilePath[];
}

export async function loadProject({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const projectConfig = await loadProjectConfig();

    const workspaceConfigurations = await getWorkspaceConfigurationPaths({
        commandLineWorkspaces,
        projectConfig,
    });

    return { projectConfig, workspaceConfigurations };
}
