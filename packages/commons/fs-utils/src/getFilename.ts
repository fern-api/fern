import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { RelativeFilePath } from "./RelativeFilePath.js";
import { splitPath } from "./splitPath.js";

export function getFilename(path: RelativeFilePath | AbsoluteFilePath): RelativeFilePath | undefined {
    if (!path.includes(".")) {
        return undefined;
    }
    const segments = splitPath(path);
    const finalSegment = segments[segments.length - 1];
    if (finalSegment == null) {
        return undefined;
    }
    return RelativeFilePath.of(finalSegment);
}
