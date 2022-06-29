import { addJavaGenerator, addPostmanGenerator, addTypescriptGenerator } from "@fern-api/add-generator";
import { loadProjectConfig, loadWorkspaceDefinitionSchema, WorkspaceDefinitionSchema } from "@fern-api/commons";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { getUniqueWorkspaces } from "../utils/getUniqueWorkspaces";

export async function addGeneratorToWorkspaces(
    commandLineWorkspaces: readonly string[],
    generatorName: "java" | "typescript" | "postman"
): Promise<void> {
    const projectConfig = await loadProjectConfig();
    const uniqueWorkspaceDefinitionPaths = await getUniqueWorkspaces({
        commandLineWorkspaces,
        projectConfig,
    });
    for (const workspaceDefinitionPath of uniqueWorkspaceDefinitionPaths) {
        const workspaceDefinition = await loadWorkspaceDefinitionSchema(workspaceDefinitionPath);
        const updatedWorkspaceDefinition = getUpdatedWorkspaceDefinition(generatorName, workspaceDefinition);
        if (updatedWorkspaceDefinition !== undefined && updatedWorkspaceDefinition !== workspaceDefinition) {
            await writeFile(workspaceDefinitionPath, yaml.dump(updatedWorkspaceDefinition));
        }
    }
}

function getUpdatedWorkspaceDefinition(
    generatorName: "java" | "typescript" | "postman",
    workspaceDefinition: WorkspaceDefinitionSchema
): WorkspaceDefinitionSchema {
    switch (generatorName) {
        case "java":
            return addJavaGenerator(workspaceDefinition);
        case "typescript":
            return addTypescriptGenerator(workspaceDefinition);
        case "postman":
            return addPostmanGenerator(workspaceDefinition);
    }
}
