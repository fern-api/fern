import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { validateSchema } from "../../validateSchema";
import { convertWorkspaceDefinition } from "./convertWorkspaceDefinition";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { substituteEnvVariables } from "./substituteEnvVariables";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export const WORKSPACE_DEFINITION_FILENAME = ".fernrc.yml";

export async function loadWorkspaceDefinitionSchema(
    absolutePathToDefinition: string
): Promise<WorkspaceDefinitionSchema> {
    const contentsStr = await readFile(absolutePathToDefinition);
    const contentsParsed = substituteEnvVariables(yaml.load(contentsStr.toString()));
    return await validateSchema<WorkspaceDefinitionSchema>(WorkspaceDefinitionSchema, contentsParsed);
}

export async function loadWorkspaceDefinition(absolutePathToDefinition: string): Promise<WorkspaceDefinition> {
    const validated = await loadWorkspaceDefinitionSchema(absolutePathToDefinition);
    return convertWorkspaceDefinition({
        workspaceDefinition: validated,
        absolutePathToDefinition,
    });
}
