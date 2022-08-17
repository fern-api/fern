import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function dirname(filepath: RelativeFilePath): RelativeFilePath;
export function dirname(filepath: AbsoluteFilePath): AbsoluteFilePath;
export function dirname(filepath: RelativeFilePath | AbsoluteFilePath): RelativeFilePath | AbsoluteFilePath {
    return path.dirname(filepath) as RelativeFilePath | AbsoluteFilePath;
}
