import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function getFilename(path: RelativeFilePath | AbsoluteFilePath): RelativeFilePath | undefined {
    if (!path.includes(".")) {
        return undefined;
    }
    const segments = path.split(/[/\\]/);
    const finalSegment = segments[segments.length - 1];
    if (finalSegment == null) {
        return undefined;
    }
    return RelativeFilePath.of(finalSegment);
}
