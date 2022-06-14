import {
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
    WorkspaceDefinitionSchema,
    WORKSPACE_DEFINITION_FILENAME,
} from "@fern-api/commons";
import { lstat, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { writeSampleApiToDirectory } from "./sampleApi";

export async function initialize(): Promise<void> {
    await writeProjectConfigIfNotExists();
    await writeApiSubDirectoryIfNotExists();
}

const API_DIRECTORY = "api";
const SRC_DIRECTORY = "src";
const API_SRC_DIRECTORY = path.join(API_DIRECTORY, SRC_DIRECTORY);

async function writeApiSubDirectoryIfNotExists(): Promise<void> {
    const apiSubDirectoryExists = await doesPathExist(API_DIRECTORY);
    if (!apiSubDirectoryExists) {
        await mkdir(API_DIRECTORY);
        await mkdir(API_SRC_DIRECTORY);
        await writeWorkspaceDefinitionFile(API_DIRECTORY);
        await writeSampleApiToDirectory(API_SRC_DIRECTORY);
    }
}

const BLOG_POST_API_WORKSPACE_DEFINITION: WorkspaceDefinitionSchema = {
    name: "Blog Post API",
    definition: SRC_DIRECTORY,
    generators: [],
};

async function writeWorkspaceDefinitionFile(dir: string): Promise<void> {
    await writeFile(path.join(dir, WORKSPACE_DEFINITION_FILENAME), yaml.dump(BLOG_POST_API_WORKSPACE_DEFINITION));
}

const DEFAULT_PROJECT_CONFIG: ProjectConfigSchema = {
    workspaces: ["**"],
};

async function writeProjectConfigIfNotExists(): Promise<void> {
    const projectConfigExists = await doesPathExist(PROJECT_CONFIG_FILENAME);
    if (!projectConfigExists) {
        await writeFile(PROJECT_CONFIG_FILENAME, JSON.stringify(DEFAULT_PROJECT_CONFIG, undefined, 4));
    }
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
