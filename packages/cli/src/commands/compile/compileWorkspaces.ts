import { getWorkspaces } from "../utils/getWorkspaces";
import { compileWorkspace } from "./compileWorkspace";

export async function compileWorkspaces({
    commandLineWorkspaces,
    runLocal,
}: {
    commandLineWorkspaces: readonly string[];
    runLocal: boolean;
}): Promise<void> {
    const uniqueWorkspaceDefinitionPaths = await getWorkspaces(commandLineWorkspaces);

    await Promise.all(
        uniqueWorkspaceDefinitionPaths.map((uniqueWorkspaceDefinitionPath) =>
            compileWorkspace({
                absolutePathToWorkspaceDefinition: uniqueWorkspaceDefinitionPath,
                runLocal,
            })
        )
    );
}
