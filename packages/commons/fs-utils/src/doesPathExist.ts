import { lstatSync } from "fs";
import { lstat, readdir } from "fs/promises";
import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function doesPathExist(filepath: AbsoluteFilePath): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}

export async function isDirectoryEmpty(directoryPath: AbsoluteFilePath): Promise<boolean> {
    const files = await readdir(directoryPath);
    return files.length === 0;
}

export function doesPathExistSync(filepath: AbsoluteFilePath): boolean {
    try {
        lstatSync(filepath);
        return true;
    } catch {
        return false;
    }
}
