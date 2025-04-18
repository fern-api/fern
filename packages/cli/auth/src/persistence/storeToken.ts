import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getPathToTokenFile } from "./getPathToTokenFile";

export async function storeToken(token: string): Promise<void> {
    const pathToTokenFile = getPathToTokenFile();
    await mkdir(path.dirname(pathToTokenFile), { recursive: true });
    await writeFile(pathToTokenFile, token);
}
