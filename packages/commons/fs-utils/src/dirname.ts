import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { convertToOsPath } from "./osPathConverter";
import { RelativeFilePath } from "./RelativeFilePath";

export function dirname(filepath: RelativeFilePath): RelativeFilePath;
export function dirname(filepath: AbsoluteFilePath): AbsoluteFilePath;
export function dirname(filepath: string): string {
    // Normalize output to use forward slashes for cross-platform consistency
    return convertToOsPath(path.dirname(filepath));
}
