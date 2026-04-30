import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getPathToTokenFile } from "./getPathToTokenFile.js";

export async function storeToken(token: string): Promise<void> {
    const pathToTokenFile = getPathToTokenFile();
    const dir = path.dirname(pathToTokenFile);
    try {
        await mkdir(dir, { recursive: true });
        await writeFile(pathToTokenFile, token);
    } catch (error) {
        if (isErrnoException(error) && (error.code === "EACCES" || error.code === "EPERM")) {
            throw new Error(
                `Permission denied writing to ${pathToTokenFile}.\n` +
                    `The directory ${dir} may be owned by another user (e.g. root).\n` +
                    `To fix, run: sudo chown -R $(whoami) ${dir}`
            );
        }
        throw error;
    }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error;
}
