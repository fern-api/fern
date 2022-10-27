import { lstat } from "fs/promises";
import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function doesPathExist(filepath: AbsoluteFilePath): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
