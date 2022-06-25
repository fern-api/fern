import { getWorkspaces } from "../utils/getWorkspaces";
import { compileWorkspace } from "./compileWorkspace";

export async function compileWorkspaces(commandLineWorkspaces: readonly string[]): Promise<void> {
    const uniqueWorkspaceDefinitionPaths = await getWorkspaces(commandLineWorkspaces);

    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map((uniqueWorkspaceDefinitionPath) =>
            compileWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
            })
        )
    );
}
