import { readFile } from "fs/promises";

export async function getFileContents(pathToFile: string): Promise<string | undefined> {
    try {
        const contents = await readFile(pathToFile);
        return contents.toString();
    } catch (e) {
        return undefined;
    }
}
