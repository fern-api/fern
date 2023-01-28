import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { findUp } from "find-up";
import { readFile } from "fs/promises";
import glob from "glob-promise";

const FERN_DIRECTORY = "fern";
const FERN_ROOT_CONFIG_FILENAME = "fern.config.json";

export async function getOrganizationName(context: TaskContext): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const fernConfigJsonBuffer = await readFile(join(fernDirectory, FERN_ROOT_CONFIG_FILENAME));
    const fernConfigJson = JSON.parse(fernConfigJsonBuffer.toString());
    const organizationName = fernConfigJson.organization;
    if (organizationName == null) {
        context.failAndThrow(`${FERN_ROOT_CONFIG_FILENAME} is missing organization`);
    }
    return organizationName;
}

export async function getAllApiYmlFiles(context: TaskContext): Promise<AbsoluteFilePath[]> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const filepaths = await glob("*/definition/api.yml", {
        cwd: fernDirectory,
        absolute: true,
    });
    return filepaths.map(AbsoluteFilePath.of);
}

async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
