import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { WorkspaceDefinitionSchema } from "./schemas/WorkspaceDefinitionSchema";
import { WorkspaceDefinition } from "./WorkspaceDefinition";

export async function loadWorkspaceDefinition(absolutePath: string): Promise<WorkspaceDefinition> {
    const contentsStr = await readFile(absolutePath);
    const contentsParsed = yaml.load(contentsStr.toString());
    const validated = await WorkspaceDefinitionSchema.parseAsync(contentsParsed);
    return {
        _absolutePath: path.dirname(absolutePath),
        name: validated.name,
        absolutePathToInput: path.resolve(validated.input),
        plugins: validated.plugins.map((plugin) => ({
            name: plugin.name,
            version: plugin.version,
            absolutePathToOutput: plugin.output != null ? path.resolve(plugin.output) : undefined,
            config: plugin.config,
            helpers:
                plugin.helpers != null
                    ? plugin.helpers.map((helper) => ({
                          name: helper.name,
                          version: helper.version,
                      }))
                    : [],
        })),
    };
}
