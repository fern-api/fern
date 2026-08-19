import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { convertToOsPath } from "./osPathConverter.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function relative(from: AbsoluteFilePath, to: AbsoluteFilePath): RelativeFilePath {
    return RelativeFilePath.of(convertToOsPath(path.relative(from, to)));
}
