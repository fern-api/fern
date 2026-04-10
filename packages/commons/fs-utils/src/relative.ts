import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function relative(from: AbsoluteFilePath, to: AbsoluteFilePath): RelativeFilePath {
    return RelativeFilePath.of(path.relative(from, to));
}
