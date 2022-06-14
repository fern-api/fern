import path from "path";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export function convertWorkspaceDefinition({
    workspaceDefinition,
    absolutePathToDefinition,
}: {
    workspaceDefinition: WorkspaceDefinitionSchema;
    absolutePathToDefinition: string;
}): WorkspaceDefinition {
    const absolutePathToWorkspaceDir = path.dirname(absolutePathToDefinition);
    return {
        _absolutePath: absolutePathToWorkspaceDir,
        name: workspaceDefinition.name,
        absolutePathToDefinition: path.resolve(absolutePathToWorkspaceDir, workspaceDefinition.definition),
        generators: workspaceDefinition.generators.map((generator) => ({
            name: generator.name,
            version: generator.version,
            absolutePathToOutput:
                generator.output != null ? path.resolve(absolutePathToWorkspaceDir, generator.output) : undefined,
            config: generator.config,
            helpers:
                generator.helpers != null
                    ? generator.helpers.map((helper) => ({
                          name: helper.name,
                          version: helper.version,
                          absoluteLocationOnDisk:
                              helper.locationOnDisk != null
                                  ? path.resolve(absolutePathToWorkspaceDir, helper.locationOnDisk)
                                  : undefined,
                      }))
                    : [],
            publish: generator.publish,
        })),
    };
}
