
import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function basename(filepath: RelativeFilePath): RelativeFilePath;
export function basename(filepath: AbsoluteFilePath): AbsoluteFilePath;
export function basename(filepath: string): string;
export function basename(filepath: string): string {
    return path.basename(filepath);
}
