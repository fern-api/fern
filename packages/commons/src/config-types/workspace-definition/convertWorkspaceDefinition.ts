import path from "path";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

// TODO "definition" already refers to the API definition.
// We should use a different word to refer to the .fernrc
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
        generators: workspaceDefinition.generators.map((generatorInvocation) => {
            return {
                name: generatorInvocation.name,
                version: generatorInvocation.version,
                generate:
                    generatorInvocation.generate != null
                        ? {
                              absolutePathToLocalOutput:
                                  generatorInvocation.generate !== true && generatorInvocation.generate.output != null
                                      ? path.resolve(absolutePathToWorkspaceDir, generatorInvocation.generate.output)
                                      : undefined,
                          }
                        : undefined,
                config: generatorInvocation.config,
                helpers:
                    generatorInvocation.helpers != null
                        ? generatorInvocation.helpers.map((helper) => ({
                              name: helper.name,
                              version: helper.version,
                              absoluteLocationOnDisk:
                                  helper.locationOnDisk != null
                                      ? path.resolve(absolutePathToWorkspaceDir, helper.locationOnDisk)
                                      : undefined,
                          }))
                        : [],
            };
        }),
    };
}
