import { cwd, doesPathExist, join, RelativeFilePath } from "@fern-api/core-utils";
import { ProjectConfigSchema, PROJECT_CONFIG_FILENAME } from "@fern-api/project-configuration";
import { WorkspaceConfigurationSchema, WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { writeSampleApiToDirectory } from "./writeSampleApiToDirectory";

export async function initialize({ organization }: { organization: string }): Promise<void> {
    await writeProjectConfigIfNotExists({ organization });
    await writeApiSubDirectoryIfNotExists();
}

const API_DIRECTORY = join(cwd(), RelativeFilePath.of("api"));
const SRC_DIRECTORY = RelativeFilePath.of("src");
const API_SRC_DIRECTORY = join(API_DIRECTORY, SRC_DIRECTORY);

const PROJECT_CONFIG_PATH = join(cwd(), RelativeFilePath.of(PROJECT_CONFIG_FILENAME));

async function writeApiSubDirectoryIfNotExists(): Promise<void> {
    const apiSubDirectoryExists = await doesPathExist(API_DIRECTORY);
    if (!apiSubDirectoryExists) {
        await mkdir(API_DIRECTORY);
        await mkdir(API_SRC_DIRECTORY);
        await writeWorkspaceConfiguration(API_DIRECTORY);
        await writeSampleApiToDirectory(API_SRC_DIRECTORY);
    }
}

const API_WORKSPACE_DEFINITION: WorkspaceConfigurationSchema = {
    name: "api",
    definition: SRC_DIRECTORY,
    generators: [],
};

async function writeWorkspaceConfiguration(dir: string): Promise<void> {
    await writeFile(path.join(dir, WORKSPACE_CONFIGURATION_FILENAME), yaml.dump(API_WORKSPACE_DEFINITION));
}

async function writeProjectConfigIfNotExists({ organization }: { organization: string }): Promise<void> {
    const projectConfigExists = await doesPathExist(PROJECT_CONFIG_PATH);
    if (!projectConfigExists) {
        const projectConfig: ProjectConfigSchema = {
            workspaces: ["**"],
            organization,
        };
        await writeFile(PROJECT_CONFIG_PATH, JSON.stringify(projectConfig, undefined, 4));
    }
}
