import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function splitPath(path: RelativeFilePath | AbsoluteFilePath): string[] {
    return path.split(/[/\\]/).filter((segment) => segment.length > 0);
}
