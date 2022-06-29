import { loadProjectConfig } from "@fern-api/commons";
import { getUniqueWorkspaces } from "../utils/getUniqueWorkspaces";
import { compileWorkspace } from "./compileWorkspace";

export async function compileWorkspaces({
    commandLineWorkspaces,
    runLocal,
}: {
    commandLineWorkspaces: readonly string[];
    runLocal: boolean;
}): Promise<void> {
    const projectConfig = await loadProjectConfig();

    const uniqueWorkspaceDefinitionPaths = await getUniqueWorkspaces({
        commandLineWorkspaces,
        projectConfig,
    });

    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map((uniqueWorkspaceDefinitionPath) =>
            compileWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
                runLocal,
                organization: projectConfig.organization,
            })
        )
    );
}
