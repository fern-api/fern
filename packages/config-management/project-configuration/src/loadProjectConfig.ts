import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/core-utils";
import { findUp } from "find-up";
import { readFile } from "fs/promises";
import { ProjectConfigSchema } from "./schemas/ProjectConfigSchema";

export interface ProjectConfig {
    workspaces: string[];
    organization: string;
}

export const PROJECT_CONFIG_FILENAME = "fern.config.json";

export async function loadProjectConfig(): Promise<ProjectConfig> {
    const pathToProjectConfigStr = await findUp(PROJECT_CONFIG_FILENAME);
    const pathToProjectConfig =
        pathToProjectConfigStr != null ? AbsoluteFilePath.of(pathToProjectConfigStr) : undefined;
    if (pathToProjectConfig == null) {
        throw new Error(`Please add a ${PROJECT_CONFIG_FILENAME} at your project's root directory.`);
    }
    return loadProjectConfigFromFilepath(pathToProjectConfig);
}

export async function loadProjectConfigFromFilepath(filepath: AbsoluteFilePath): Promise<ProjectConfig> {
    const projectConfigStr = await readFile(filepath);
    const projectConfigParsed = JSON.parse(projectConfigStr.toString()) as unknown;
    const projectConfig = await validateSchema(ProjectConfigSchema, projectConfigParsed);
    return {
        workspaces: projectConfig.workspaces ?? [],
        organization: projectConfig.organization,
    };
}
