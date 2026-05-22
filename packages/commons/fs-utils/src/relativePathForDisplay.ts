import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { convertToOsPath } from "./osPathConverter.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function relativePathForDisplay(
    from: AbsoluteFilePath,
    to: AbsoluteFilePath,
    pathModule: Pick<typeof path, "isAbsolute" | "relative" | "basename"> = path
): RelativeFilePath {
    const relativePath = convertToOsPath(pathModule.relative(from, to));
    if (!pathModule.isAbsolute(relativePath)) {
        return RelativeFilePath.of(relativePath);
    }
    return RelativeFilePath.of(pathModule.basename(to));
}
