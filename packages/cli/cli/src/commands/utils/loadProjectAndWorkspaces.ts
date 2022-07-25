import { loadProjectConfig, ProjectConfig } from "@fern-api/project-configuration";
import { getUniqueWorkspaces } from "./getUniqueWorkspaces";

export async function loadProjectAndWorkspaces({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<{
    projectConfig: ProjectConfig;
    workspacePaths: string[];
}> {
    const projectConfig = await loadProjectConfig();

    const workspacePaths = await getUniqueWorkspaces({
        commandLineWorkspaces,
        projectConfig,
    });

    return { projectConfig, workspacePaths };
}
