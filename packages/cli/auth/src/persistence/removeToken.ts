import { unlink } from "fs/promises";
import { getPathToTokenFile } from "./getPathToTokenFile";

export async function removeToken(): Promise<void> {
    const pathToTokenFile = getPathToTokenFile();
    try {
        await unlink(pathToTokenFile);
    } catch (error) {
        // If the file doesn't exist, that's fine - the user is already logged out
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }
    }
}
