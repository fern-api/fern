import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function join(first: RelativeFilePath, ...parts: RelativeFilePath[]): RelativeFilePath;
export function join(first: AbsoluteFilePath, ...parts: RelativeFilePath[]): AbsoluteFilePath;
export function join(...parts: RelativeFilePath[]): RelativeFilePath;
export function join(...parts: string[]): string {
    return path.join(...parts);
}
