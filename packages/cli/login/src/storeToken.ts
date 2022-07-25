import { mkdir, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

export async function storeToken(token: string): Promise<void> {
    const pathToTokenFile = path.join(homedir(), ".fern", "token");
    await mkdir(path.dirname(pathToTokenFile), { recursive: true });
    await writeFile(pathToTokenFile, token);
}
