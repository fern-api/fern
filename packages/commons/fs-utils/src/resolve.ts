import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { convertToOsPath } from "./osPathConverter";

export function resolve(first: AbsoluteFilePath, ...rest: string[]): AbsoluteFilePath;
export function resolve(...paths: string[]): string {
    // Normalize both inputs and output to use forward slashes for cross-platform consistency
    return convertToOsPath(path.resolve(...paths.map(convertToOsPath)));
}
