import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function join(first: RelativeFilePath, ...parts: RelativeFilePath[]): RelativeFilePath;
export function join(first: AbsoluteFilePath, ...parts: RelativeFilePath[]): AbsoluteFilePath;
export function join(...parts: RelativeFilePath[]): RelativeFilePath;
export function join(...parts: string[]): string {
    return path.join(...parts);
}
