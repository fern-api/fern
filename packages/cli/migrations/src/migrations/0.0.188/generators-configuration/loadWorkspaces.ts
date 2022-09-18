import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { findUp } from "find-up";
import { readdir } from "fs/promises";

const FERN_DIRECTORY = "fern";

export async function loadWorkspaces(context: TaskContext): Promise<AbsoluteFilePath[] | TASK_FAILURE> {
    const pathToFernDirectory = await getPathToFernDirectory();
    if (pathToFernDirectory == null) {
        return context.fail(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const fernDirectoryContents = await readdir(pathToFernDirectory, { withFileTypes: true });
    return fernDirectoryContents.reduce<AbsoluteFilePath[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(join(pathToFernDirectory, RelativeFilePath.of(item.name)));
        }
        return all;
    }, []);
}

async function getPathToFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
