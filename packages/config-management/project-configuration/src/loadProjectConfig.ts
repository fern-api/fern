import { validateSchema } from "@fern-api/config-management-commons";
import { findUp } from "find-up";
import { readFile } from "fs/promises";
import { ProjectConfigSchema } from "./schemas/ProjectConfigSchema";

export interface ProjectConfig {
    workspaces: string[];
    organization: string;
}

export const PROJECT_CONFIG_FILENAME = "fern.config.json";

export async function loadProjectConfig(): Promise<ProjectConfig> {
    const pathToProjectConfig = await findUp(PROJECT_CONFIG_FILENAME);
    if (pathToProjectConfig == null) {
        throw new Error("Please add a " + PROJECT_CONFIG_FILENAME + "at your project's root directory.");
    }
    return loadProjectConfigFromFilepath(pathToProjectConfig);
}

export async function loadProjectConfigFromFilepath(filepath: string): Promise<ProjectConfig> {
    const projectConfigStr = await readFile(filepath);
    const projectConfigParsed = JSON.parse(projectConfigStr.toString()) as unknown;
    const projectConfig = await validateSchema(ProjectConfigSchema, projectConfigParsed);
    return {
        workspaces: projectConfig.workspaces ?? [],
        organization: projectConfig.organization,
    };
}
