import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function relativize(fromPath: AbsoluteFilePath, toPath: AbsoluteFilePath): RelativeFilePath {
    return RelativeFilePath.of(path.relative(fromPath, toPath));
}
