import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertWorkspaceDefinition } from "./convertWorkspaceDefinition";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export const WORKSPACE_DEFINITION_FILENAME = ".fernrc.yml";

export async function loadWorkspaceDefinition(absolutePathToDefinition: string): Promise<WorkspaceDefinition> {
    const contentsStr = await readFile(absolutePathToDefinition);
    const contentsParsed = yaml.load(contentsStr.toString());
    const validated = await WorkspaceDefinitionSchema.parseAsync(contentsParsed);
    return convertWorkspaceDefinition({
        definition: validated,
        absolutePathToDefinition,
    });
}
