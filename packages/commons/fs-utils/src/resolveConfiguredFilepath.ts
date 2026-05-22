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

export function resolveConfiguredFilepaths({
    absolutePathToWorkspace,
    configuredFilepaths
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    configuredFilepaths: string | string[];
}): AbsoluteFilePath | AbsoluteFilePath[] {
    if (Array.isArray(configuredFilepaths)) {
        return configuredFilepaths.map((configuredFilepath) =>
            resolveConfiguredFilepath({ absolutePathToWorkspace, configuredFilepath })
        );
    }
    return resolveConfiguredFilepath({ absolutePathToWorkspace, configuredFilepath: configuredFilepaths });
}
