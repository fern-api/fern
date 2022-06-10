import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertWorkspaceDefinition } from "./convertWorkspaceDefinition";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export const WORKSPACE_DEFINITION_FILENAME = ".fernrc.yml";

export async function loadWorkspaceDefinitionSchema(
    absolutePathToDefinition: string
): Promise<WorkspaceDefinitionSchema> {
    const contentsStr = await readFile(absolutePathToDefinition);
    const contentsParsed = yaml.load(contentsStr.toString());
    return await WorkspaceDefinitionSchema.parseAsync(contentsParsed);
}

export async function loadWorkspaceDefinition(absolutePathToDefinition: string): Promise<WorkspaceDefinition> {
    const validated = await loadWorkspaceDefinitionSchema(absolutePathToDefinition);
    return convertWorkspaceDefinition({
        workspaceDefinition: validated,
        absolutePathToDefinition,
    });
}
