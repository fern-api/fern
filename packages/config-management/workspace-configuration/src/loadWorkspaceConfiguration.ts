import { validateSchema } from "@fern-api/config-management-commons";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertWorkspaceConfiguration } from "./convertWorkspaceConfiguration";
import { WorkspaceConfigurationSchema } from "./schemas/WorkspaceConfigurationSchema";
import { substituteEnvVariables } from "./substituteEnvVariables";
import { WorkspaceConfiguration } from "./WorkspaceConfiguration";

export const WORKSPACE_CONFIGURATION_FILENAME = ".fernrc.yml";

export async function loadRawWorkspaceConfiguration(
    absolutePathToConfiguration: string
): Promise<WorkspaceConfigurationSchema> {
    const contentsStr = await readFile(absolutePathToConfiguration);
    const contentsParsed = substituteEnvVariables(yaml.load(contentsStr.toString()));
    return await validateSchema<WorkspaceConfigurationSchema>(WorkspaceConfigurationSchema, contentsParsed);
}

export async function loadWorkspaceConfiguration(absolutePathToConfiguration: string): Promise<WorkspaceConfiguration> {
    const validated = await loadRawWorkspaceConfiguration(absolutePathToConfiguration);
    return convertWorkspaceConfiguration({
        workspaceConfiguration: validated,
        absolutePathToConfiguration,
    });
}
