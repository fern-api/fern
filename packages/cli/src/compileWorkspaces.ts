import { loadProjectConfig } from "@fern-api/compiler-commons";
import { compileWorkspace } from "./compileWorkspace";
import { getWorkspaces } from "./getWorkspaces";

export async function compileWorkspaces(commandLineWorkspaces: readonly string[]): Promise<void> {
    const projectConfig = await loadProjectConfig();
    const uniqueWorkspaceDefinitionPaths = await getWorkspaces(commandLineWorkspaces);

    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map((uniqueWorkspaceDefinitionPath) =>
            compileWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
                absolutePathToProjectConfig: projectConfig?._absolutePath,
            })
        )
    );
}
