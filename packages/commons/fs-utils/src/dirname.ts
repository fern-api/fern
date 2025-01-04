import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function dirname(filepath: RelativeFilePath): RelativeFilePath;
export function dirname(filepath: AbsoluteFilePath): AbsoluteFilePath;
export function dirname(filepath: string): string {
    return path.dirname(filepath);
}
