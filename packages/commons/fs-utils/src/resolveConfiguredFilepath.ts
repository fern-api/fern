import path from "path";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { join } from "./join.js";
import { RelativeFilePath } from "./RelativeFilePath.js";

export function resolveConfiguredFilepath({
    absolutePathToWorkspace,
    configuredFilepath
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    configuredFilepath: string;
}): AbsoluteFilePath {
    if (path.isAbsolute(configuredFilepath)) {
        return AbsoluteFilePath.of(configuredFilepath);
    }
    return join(absolutePathToWorkspace, RelativeFilePath.of(configuredFilepath));
}
