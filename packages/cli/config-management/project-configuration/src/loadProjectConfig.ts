import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join } from "@fern-api/core-utils";
import { readFile } from "fs/promises";
import { PROJECT_CONFIG_FILENAME } from "./constants";
import { ProjectConfigSchema } from "./schemas/ProjectConfigSchema";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    rawConfig: ProjectConfigSchema;
    organization: string;
    version: string;
}

export async function loadProjectConfig({ directory }: { directory: AbsoluteFilePath }): Promise<ProjectConfig> {
    const pathToConfig = join(directory, PROJECT_CONFIG_FILENAME);
    const projectConfigStr = await readFile(pathToConfig);
    const projectConfigParsed = JSON.parse(projectConfigStr.toString()) as unknown;
    const rawProjectConfig = await validateSchema(ProjectConfigSchema, projectConfigParsed);
    return {
        _absolutePath: pathToConfig,
        rawConfig: rawProjectConfig,
        organization: rawProjectConfig.organization,
        version: rawProjectConfig.version,
    };
}
