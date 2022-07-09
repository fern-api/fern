import { addJavaGenerator, addPostmanGenerator, addTypescriptGenerator } from "@fern-api/add-generator";
import { loadWorkspaceDefinitionSchema, WorkspaceDefinitionSchema } from "@fern-api/commons";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { loadProjectAndWorkspaces } from "../utils/loadProjectAndWorkspaces";

export async function addGeneratorToWorkspaces(
    commandLineWorkspaces: readonly string[],
    generatorName: "java" | "typescript" | "postman"
): Promise<void> {
    const { workspacePaths } = await loadProjectAndWorkspaces({ commandLineWorkspaces });

    for (const workspaceDefinitionPath of workspacePaths) {
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
