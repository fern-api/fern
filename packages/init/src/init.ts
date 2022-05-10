import {
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
    WorkspaceDefinitionSchema,
    WORKSPACE_DEFINITION_FILENAME,
} from "@fern-api/compiler-commons";
import { lstat, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { writeSampleApiToDirectory } from "./sampleApi";

export async function initialize(): Promise<void> {
    await writeProjectConfigIfNotExists();
    await writeApiSubDirectoryIfNotExists();
}

const API_DIRECTORY = "fern-api";
const SRC_DIRECTORY = "src";
const API_SRC_DIRECTORY = path.join(API_DIRECTORY, SRC_DIRECTORY);
const API_WORKSPACE_DEFINITION_FILE = path.join(API_SRC_DIRECTORY, WORKSPACE_DEFINITION_FILENAME);

async function writeApiSubDirectoryIfNotExists(): Promise<void> {
    if (!doesPathExist(API_DIRECTORY)) {
        await mkdir(API_DIRECTORY);
        await mkdir(API_SRC_DIRECTORY);
        await writeWorkspaceDefinitionFile(API_DIRECTORY);
        await writeSampleApiToDirectory(API_WORKSPACE_DEFINITION_FILE);
    }
}

const BLOG_POST_API_WORKSPACE_DEFINITION: WorkspaceDefinitionSchema = {
    name: "Blog Post API",
    input: SRC_DIRECTORY,
    plugins: [],
};

async function writeWorkspaceDefinitionFile(dir: string): Promise<void> {
    await writeFile(dir, yaml.dump(BLOG_POST_API_WORKSPACE_DEFINITION));
}

const DEFAULT_PROJECT_CONFIG: ProjectConfigSchema = {
    workspaces: ["**"],
};

async function writeProjectConfigIfNotExists(): Promise<void> {
    if (!doesPathExist(PROJECT_CONFIG_FILENAME)) {
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
