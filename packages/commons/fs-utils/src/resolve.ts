import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { convertToOsPath } from "./osPathConverter";

export function resolve(first: AbsoluteFilePath, ...rest: string[]): AbsoluteFilePath;
export function resolve(...paths: string[]): string {
    return path.resolve(...paths.map(convertToOsPath));
}
