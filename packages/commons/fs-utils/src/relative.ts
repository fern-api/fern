import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function relative(from: AbsoluteFilePath, to: AbsoluteFilePath): RelativeFilePath {
    return RelativeFilePath.of(path.relative(from, to));
}
