import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function splitPath(path: RelativeFilePath | AbsoluteFilePath): string[] {
    return path.split(/[/\\]/).filter((segment) => segment.length > 0);
}
