import {
    addJavaGenerator,
    addOpenApiGenerator,
    addPostmanGenerator,
    addTypescriptGenerator,
} from "@fern-api/add-generator";
import { loadRawWorkspaceConfiguration, WorkspaceConfigurationSchema } from "@fern-api/workspace-configuration";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { loadProject } from "../utils/load-project/loadProject";

export async function addGeneratorToWorkspaces(
    commandLineWorkspaces: readonly string[],
    generatorName: "java" | "typescript" | "postman" | "openapi"
): Promise<void> {
    const { workspaceConfigurations } = await loadProject({ commandLineWorkspaces });

    for (const workspaceConfigurationFilePath of workspaceConfigurations) {
        const workspaceConfiguration = await loadRawWorkspaceConfiguration(workspaceConfigurationFilePath);
        const updatedWorkspaceConfiguration = addGeneratorToWorkspaceConfiguration(
            generatorName,
            workspaceConfiguration
        );
        if (updatedWorkspaceConfiguration !== workspaceConfiguration) {
            await writeFile(workspaceConfigurationFilePath, yaml.dump(updatedWorkspaceConfiguration));
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
