import { AbsoluteFilePath } from "@fern-api/core-utils";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { findUp } from "find-up";
import glob from "glob-promise";

const FERN_DIRECTORY = "fern";

export async function getAllYamlFiles(context: TaskContext): Promise<AbsoluteFilePath[] | TASK_FAILURE> {
    const pathToFernDirectory = await getPathToFernDirectory();
    if (pathToFernDirectory == null) {
        return context.fail(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const filepaths = await glob("*/definition/**/*.yml", {
        cwd: pathToFernDirectory,
        absolute: true,
    });
    return filepaths.map(AbsoluteFilePath.of);
}

async function getPathToFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
