import { findUp } from "find-up";
import { glob } from "glob";

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

const FERN_DIRECTORY = "fern";

export async function getAllYamlFiles(context: TaskContext): Promise<AbsoluteFilePath[]> {
    const fernDirectory = await getFernDirectory();
    const alphasort = (a: string, b: string) => a.localeCompare(b, "en");
    if (fernDirectory == null) {
        context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const filepaths = await glob("*/definition/**/*.yml", {
        cwd: fernDirectory,
        absolute: true
    });
    return filepaths.sort(alphasort).map(AbsoluteFilePath.of);
}

async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
