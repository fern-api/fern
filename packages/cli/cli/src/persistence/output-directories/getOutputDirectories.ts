import { readFile } from "fs/promises";

import { AbsoluteFilePath, doesPathExist } from "@fern-api/fs-utils";

import { getPathToOutputDirectoriesFile } from "./getPathToOutputDirectoriesFile";

export async function getOutputDirectories(): Promise<AbsoluteFilePath[]> {
    const pathToOutputDirectoriesFile = getPathToOutputDirectoriesFile();
    const doesOutputDirectoriesFileExist = await doesPathExist(pathToOutputDirectoriesFile);
    if (!doesOutputDirectoriesFileExist) {
        return [];
    }

    const outputDirectoriesFileContents = await readFile(pathToOutputDirectoriesFile, { encoding: "utf-8" });
    const outputDirectories: AbsoluteFilePath[] = JSON.parse(outputDirectoriesFileContents);

    return outputDirectories;
}
