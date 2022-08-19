import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { readFile } from "fs/promises";
import { ProjectConfigSchema } from "./schemas/ProjectConfigSchema";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    organization: string;
    version: string;
}

export const PROJECT_CONFIG_FILENAME = "fern.config.json";

export async function loadProjectConfig({ directory }: { directory: AbsoluteFilePath }): Promise<ProjectConfig> {
    const pathToConfig = join(directory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME));
    const projectConfigStr = await readFile(pathToConfig);
    const projectConfigParsed = JSON.parse(projectConfigStr.toString()) as unknown;
    const projectConfig = await validateSchema(ProjectConfigSchema, projectConfigParsed);
    return {
        _absolutePath: pathToConfig,
        organization: projectConfig.organization,
        version: projectConfig.version,
    };
}
