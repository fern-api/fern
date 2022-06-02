import path from "path";
import { PluginInvocationSchema } from "./schemas/PluginInvocationSchema";
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
        absolutePathToInput: path.resolve(absolutePathToWorkspaceDir, getDefinitionLocation(definition)),
        plugins: getGenerators(definition).map((plugin) => ({
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
                          absoluteLocationOnDisk:
                              helper.locationOnDisk != null
                                  ? path.resolve(absolutePathToWorkspaceDir, helper.locationOnDisk)
                                  : undefined,
                      }))
                    : [],
        })),
    };
}

function getDefinitionLocation(definition: WorkspaceDefinitionSchema): string {
    if (definition.definition != null) {
        return definition.definition;
    } else if (definition.input != null) {
        return definition.input;
    } else {
        throw new Error(".fernrc.yml is missing definition");
    }
}

function getGenerators(definition: WorkspaceDefinitionSchema): PluginInvocationSchema[] {
    if (definition.generators != null) {
        return definition.generators;
    } else if (definition.plugins != null) {
        return definition.plugins;
    } else {
        throw new Error(".fernrc.yml is missing generators");
    }
}
