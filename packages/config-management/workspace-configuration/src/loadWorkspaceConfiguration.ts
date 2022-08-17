import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/core-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertWorkspaceConfiguration } from "./convertWorkspaceConfiguration";
import { WorkspaceConfigurationSchema } from "./schemas/WorkspaceConfigurationSchema";
import { substituteEnvVariables } from "./substituteEnvVariables";
import { WorkspaceConfiguration } from "./WorkspaceConfiguration";

export const WORKSPACE_CONFIGURATION_FILENAME = ".fernrc.yml";

export async function loadRawWorkspaceConfiguration(
    absolutePathToConfiguration: AbsoluteFilePath
): Promise<WorkspaceConfigurationSchema> {
    const contentsStr = await readFile(absolutePathToConfiguration);
    const contentsParsed = substituteEnvVariables(yaml.load(contentsStr.toString()));
    return await validateSchema<WorkspaceConfigurationSchema>(WorkspaceConfigurationSchema, contentsParsed);
}

export async function loadWorkspaceConfiguration(
    absolutePathToConfiguration: AbsoluteFilePath
): Promise<WorkspaceConfiguration> {
    const validated = await loadRawWorkspaceConfiguration(absolutePathToConfiguration);
    return convertWorkspaceConfiguration({
        workspaceConfiguration: validated,
        absolutePathToConfiguration,
    });
}
