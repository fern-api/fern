import { mkdir, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

export async function storeToken(token: string): Promise<void> {
    if (process.env.LOCAL_STORAGE_FOLDER == null) {
        throw new Error("Failed to store token: path to local storage is undefined!");
    }
    const pathToTokenFile = path.join(homedir(), process.env.LOCAL_STORAGE_FOLDER, "token");
    await mkdir(path.dirname(pathToTokenFile), { recursive: true });
    await writeFile(pathToTokenFile, token);
}
