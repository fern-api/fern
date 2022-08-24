import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { findUp } from "find-up";
import { readdir } from "fs/promises";

const FERN_DIRECTORY = "fern";

export async function loadWorkspaces(context: TaskContext): Promise<AbsoluteFilePath[] | TASK_FAILURE> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return context.fail(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    return fernDirectoryContents.reduce<AbsoluteFilePath[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(join(fernDirectory, RelativeFilePath.of(item.name)));
        }
        return all;
    }, []);
}

async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(fernDirectoryStr);
}
