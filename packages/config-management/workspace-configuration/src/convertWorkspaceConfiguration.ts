import { AbsoluteFilePath, dirname, resolve } from "@fern-api/core-utils";
import { WorkspaceConfigurationSchema } from "./schemas/WorkspaceConfigurationSchema";
import { WorkspaceConfiguration } from "./WorkspaceConfiguration";

// TODO "definition" already refers to the API definition.
// We should use a different word to refer to the .fernrc
export function convertWorkspaceConfiguration({
    workspaceConfiguration,
    absolutePathToConfiguration,
}: {
    workspaceConfiguration: WorkspaceConfigurationSchema;
    absolutePathToConfiguration: AbsoluteFilePath;
}): WorkspaceConfiguration {
    const absolutePathToWorkspaceDir = dirname(absolutePathToConfiguration);
    return {
        _absolutePath: absolutePathToWorkspaceDir,
        name: workspaceConfiguration.name,
        absolutePathToDefinition: resolve(absolutePathToWorkspaceDir, workspaceConfiguration.definition),
        generators: workspaceConfiguration.generators.map((generatorInvocation) => {
            return {
                name: generatorInvocation.name,
                version: generatorInvocation.version,
                generate:
                    generatorInvocation.generate != null
                        ? {
                              absolutePathToLocalOutput:
                                  generatorInvocation.generate !== true && generatorInvocation.generate.output != null
                                      ? resolve(absolutePathToWorkspaceDir, generatorInvocation.generate.output)
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
                                      ? resolve(absolutePathToWorkspaceDir, helper.locationOnDisk)
                                      : undefined,
                          }))
                        : [],
            };
        }),
    };
}
