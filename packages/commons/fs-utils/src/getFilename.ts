import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";
import { splitPath } from "./splitPath";

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
