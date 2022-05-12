import { addJavaPlugin, addTypescriptPlugin } from "@fern-api/add-plugin";
import { loadWorkspaceDefinitionSchema, WorkspaceDefinitionSchema } from "@fern-api/compiler-commons";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { getWorkspaces } from "../utils/getWorkspaces";

export async function addPluginToWorkspaces(
    commandLineWorkspaces: readonly string[],
    pluginName: "java" | "typescript"
): Promise<void> {
    const uniqueWorkspaceDefinitionPaths = await getWorkspaces(commandLineWorkspaces);
    for (const workspaceDefinitionPath of uniqueWorkspaceDefinitionPaths) {
        const workspaceDefinition = await loadWorkspaceDefinitionSchema(workspaceDefinitionPath);
        const updatedWorkspaceDefinition = getUpdatedWorkspaceDefinition(pluginName, workspaceDefinition);
        if (updatedWorkspaceDefinition !== undefined && updatedWorkspaceDefinition !== workspaceDefinition) {
            await writeFile(workspaceDefinitionPath, yaml.dump(updatedWorkspaceDefinition));
        }
    }
}

function getUpdatedWorkspaceDefinition(
    pluginName: "java" | "typescript",
    workspaceDefinition: WorkspaceDefinitionSchema
): WorkspaceDefinitionSchema | undefined {
    if (pluginName === "java") {
        return addJavaPlugin(workspaceDefinition);
    } else if (pluginName === "typescript") {
        return addTypescriptPlugin(workspaceDefinition);
    }
    return undefined;
}
