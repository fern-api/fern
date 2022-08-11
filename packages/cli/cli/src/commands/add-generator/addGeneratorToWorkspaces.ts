import {
    addJavaGenerator,
    addOpenApiGenerator,
    addPostmanGenerator,
    addTypescriptGenerator,
} from "@fern-api/manage-generator";
import { loadRawWorkspaceConfiguration, WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { loadProject } from "../utils/load-project/loadProject";

export async function addGeneratorToWorkspaces(
    commandLineWorkspaces: readonly string[],
    generatorName: "java" | "typescript" | "postman" | "openapi"
): Promise<void> {
    const { workspaces } = await loadProject({ commandLineWorkspaces });

    for (const workspace of workspaces) {
        const workspaceConfiguration = await loadRawWorkspaceConfiguration(workspace.workspaceConfigurationFilePath);
        const updatedWorkspaceConfiguration = addGeneratorToWorkspaceConfiguration(
            generatorName,
            workspaceConfiguration
        );
        if (updatedWorkspaceConfiguration !== workspaceConfiguration) {
            await writeFile(workspace.workspaceConfigurationFilePath, yaml.dump(updatedWorkspaceConfiguration));
        }
    }
}

function addGeneratorToWorkspaceConfiguration(
    generatorName: "java" | "typescript" | "postman" | "openapi",
    workspaceConfiguration: WorkspaceConfigurationSchema
): WorkspaceConfigurationSchema {
    switch (generatorName) {
        case "java":
            return addJavaGenerator(workspaceConfiguration);
        case "typescript":
            return addTypescriptGenerator(workspaceConfiguration);
        case "postman":
            return addPostmanGenerator(workspaceConfiguration);
        case "openapi":
            return addOpenApiGenerator(workspaceConfiguration);
    }
}
