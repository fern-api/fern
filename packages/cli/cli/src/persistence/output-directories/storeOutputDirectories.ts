import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { getPathToOutputDirectoriesFile } from "./getPathToOutputDirectoriesFile";

export async function storeOutputDirectories(outputDirectories: AbsoluteFilePath[]): Promise<void> {
    await mkdir(path.dirname(getPathToOutputDirectoriesFile()), { recursive: true });
    await writeFile(getPathToOutputDirectoriesFile(), JSON.stringify(outputDirectories, null, 2));
}
