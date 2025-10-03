import { lstatSync } from "fs";
import { lstat, readdir } from "fs/promises";

import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function isPathEmpty(filepath: AbsoluteFilePath): Promise<boolean> {
    try {
        const stat = await lstat(filepath);

        if (stat.isFile()) {
            return stat.size === 0;
        }

        if (stat.isDirectory()) {
            const entries = await readdir(filepath);
            return entries.length === 0;
        }

        return false;
    } catch {
        // if we can't access the path, consider it empty
        return true;
    }
}

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
