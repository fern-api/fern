import { loadProjectAndWorkspaces } from "../utils/loadProjectAndWorkspaces";
import { parseAndValidateWorkspace } from "./validateWorkspace";

export async function validateWorkspaces({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<void> {
    const { workspacePaths } = await loadProjectAndWorkspaces({
        commandLineWorkspaces,
    });

    await Promise.all(
        workspacePaths.map((uniqueWorkspaceDefinitionPath) =>
            parseAndValidateWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
            })
        )
    );
}
