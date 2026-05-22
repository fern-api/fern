import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { convertToOsPath } from "./osPathConverter.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function isAbsoluteFilePath(filepath: RelativeFilePath | AbsoluteFilePath): filepath is AbsoluteFilePath {
    return path.isAbsolute(filepath);
}

export function relativeOrOriginalPath(
    from: AbsoluteFilePath,
    to: AbsoluteFilePath,
    pathModule: Pick<typeof path, "isAbsolute" | "relative"> = path
): RelativeFilePath | AbsoluteFilePath {
    const relativePath = convertToOsPath(pathModule.relative(from, to));
    if (pathModule.isAbsolute(relativePath)) {
        return to;
    }
    return RelativeFilePath.of(relativePath);
}
