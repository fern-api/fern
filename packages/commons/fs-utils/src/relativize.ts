import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function relativize(fromPath: AbsoluteFilePath, toPath: AbsoluteFilePath): RelativeFilePath {
    return RelativeFilePath.of(path.relative(fromPath, toPath));
}
