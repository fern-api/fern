import path from "path";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export function convertWorkspaceDefinition({
    definition,
    absolutePathToDefinition,
}: {
    definition: WorkspaceDefinitionSchema;
    absolutePathToDefinition: string;
}): WorkspaceDefinition {
    const absolutePathToWorkspaceDir = path.dirname(absolutePathToDefinition);
    return {
        _absolutePath: absolutePathToWorkspaceDir,
        name: definition.name,
        absolutePathToInput: path.resolve(absolutePathToWorkspaceDir, definition.input),
        plugins: definition.plugins.map((plugin) => ({
            name: plugin.name,
            version: plugin.version,
            absolutePathToOutput:
                plugin.output != null ? path.resolve(absolutePathToWorkspaceDir, plugin.output) : undefined,
            config: plugin.config,
            helpers:
                plugin.helpers != null
                    ? plugin.helpers.map((helper) => ({
                          name: helper.name,
                          version: helper.version,
                          locationOnDisk: helper.locationOnDisk,
                      }))
                    : [],
        })),
    };
}
