import { doesPathExist } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { getPathToOutputDirectoriesFile } from "./getPathToOutputDirectoriesFile";

export async function getOutputDirectories(): Promise<string[]> {
    const pathToOutputDirectoriesFile = getPathToOutputDirectoriesFile();
    const doesOutputDirectoriesFileExist = await doesPathExist(pathToOutputDirectoriesFile);
    if (!doesOutputDirectoriesFileExist) {
        return [];
    }

    const outputDirectoriesFileContents = await readFile(pathToOutputDirectoriesFile);
    const outputDirectories: string[] = JSON.parse(outputDirectoriesFileContents.toString());

    return outputDirectories;
}
