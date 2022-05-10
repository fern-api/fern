import {
    ProjectConfigSchema,
    PROJECT_CONFIG_FILENAME,
    WorkspaceDefinitionSchema,
    WORKSPACE_DEFINITION_FILENAME,
} from "@fern-api/compiler-commons";
import { lstat, mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { writeSampleApiToDirectory } from "./sampleApi";

export async function initialize(): Promise<void> {
    await writeProjectConfigIfNotExists();
    await writeApiSubDirectoryIfNotExists();
}

const API_DIRECTORY = "fern-api";
const SRC_DIRECTORY = "src";
const API_SRC_DIRECTORY = `${API_DIRECTORY}/${SRC_DIRECTORY}`;
const API_WORKSPACE_DEFINITION_FILE = `${API_DIRECTORY}/src/${WORKSPACE_DEFINITION_FILENAME}`;

async function writeApiSubDirectoryIfNotExists(): Promise<void> {
    if (!doesPathExist(API_DIRECTORY)) {
        await mkdir(API_DIRECTORY);
        await mkdir(API_SRC_DIRECTORY);
        await writeWorkspaceDefinitionFile(API_DIRECTORY);
        await writeSampleApiToDirectory(API_WORKSPACE_DEFINITION_FILE);
    }
}

async function writeWorkspaceDefinitionFile(dir: string): Promise<void> {
    const workspaceDefinition: WorkspaceDefinitionSchema = {
        name: "Food Delivery API",
        input: SRC_DIRECTORY,
        plugins: [],
    };
    await writeFile(dir, yaml.dump(workspaceDefinition));
}

const DEFAULT_PROJECT_CONFIG: ProjectConfigSchema = {
    workspaces: ["**"],
};

async function writeProjectConfigIfNotExists(): Promise<void> {
    if (!doesPathExist(PROJECT_CONFIG_FILENAME)) {
        await writeFile(PROJECT_CONFIG_FILENAME, JSON.stringify(DEFAULT_PROJECT_CONFIG));
    }
}

export async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
