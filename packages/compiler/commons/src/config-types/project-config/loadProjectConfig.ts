import findUp from "find-up";
import { readFile } from "fs/promises";
import path from "path";
import { ProjectConfigSchema } from "./schemas/ProjectConfigSchema";

export interface ProjectConfig {
    _absolutePath: string;

    workspaces: string[];
}

export const PROJECT_CONFIG_FILENAME = "fern.config.json";

export async function loadProjectConfig(): Promise<ProjectConfig | undefined> {
    const pathToProjectConfig = await findUp(PROJECT_CONFIG_FILENAME);
    if (pathToProjectConfig == null) {
        return undefined;
    }
    const projectConfigStr = await readFile(pathToProjectConfig);
    const projectConfigParsed = JSON.parse(projectConfigStr.toString()) as unknown;
    const projectConfig = await ProjectConfigSchema.parseAsync(projectConfigParsed);
    return {
        workspaces: projectConfig.workspaces ?? [],
        _absolutePath: path.resolve(pathToProjectConfig),
    };
}
