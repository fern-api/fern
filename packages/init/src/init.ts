import { ProjectConfigSchema, PROJECT_CONFIG_FILENAME } from "@fern-api/compiler-commons";
import { lstat, mkdir, writeFile } from "fs/promises";
import { writeSampleApiToDirectory } from "./sampleApi";

export async function initialize(): Promise<void> {
    await writeProjectConfigIfNotExists();
    await writeApiSubDirectoryIfNotExists();
}

const API_DIRECTORY = "fern-api";
const API_SRC_DIRECTORY = `${API_DIRECTORY}/src`;

async function writeApiSubDirectoryIfNotExists(): Promise<void> {
    if (!doesPathExist(API_DIRECTORY)) {
        await mkdir(API_DIRECTORY);
        await mkdir(API_SRC_DIRECTORY);
        await writeSampleApiToDirectory(API_SRC_DIRECTORY);
    }
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
