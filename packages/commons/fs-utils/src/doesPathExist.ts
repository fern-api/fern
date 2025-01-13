import { lstatSync } from "fs";
import { lstat } from "fs/promises";

import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function doesPathExist(filepath: AbsoluteFilePath, mode?: "file" | "directory"): Promise<boolean> {
    try {
        const stat = await lstat(filepath);
        if (mode === "file" && !stat.isFile()) {
            return false;
        }
        if (mode === "directory" && !stat.isDirectory()) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export function doesPathExistSync(filepath: AbsoluteFilePath, mode?: "file" | "directory"): boolean {
    try {
        const stat = lstatSync(filepath);
        if (mode === "file" && !stat.isFile()) {
            return false;
        }
        if (mode === "directory" && !stat.isDirectory()) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}
