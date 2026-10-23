import { LOCAL_STORAGE_FOLDER } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { homedir } from "os";

import { APPROVED_DIRECTORIES_FILENAME } from "../../constants.js";

export function getPathToOutputDirectoriesFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(APPROVED_DIRECTORIES_FILENAME)
    );
}
