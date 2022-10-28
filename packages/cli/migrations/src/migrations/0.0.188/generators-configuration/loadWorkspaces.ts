import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { findUp } from "find-up";
import { readdir } from "fs/promises";

const FERN_DIRECTORY = "fern";

export async function loadWorkspaces(context: TaskContext): Promise<AbsoluteFilePath[]> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
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
