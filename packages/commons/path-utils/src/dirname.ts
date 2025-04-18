import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function dirname(filepath: RelativeFilePath): RelativeFilePath;
export function dirname(filepath: AbsoluteFilePath): AbsoluteFilePath;
export function dirname(filepath: string): string {
    const trimmed = filepath.replace(/\/+$/, "");
    const lastSlashIndex = trimmed.lastIndexOf("/");
    if (lastSlashIndex === -1) {
        return ".";
    }
    if (lastSlashIndex === 0) {
        return "/";
    }
    return filepath.slice(0, lastSlashIndex);
}
