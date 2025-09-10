import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { homedir } from "os";

import { APPROVED_DIRECTORIES_FILENAME, LOCAL_STORAGE_FOLDER } from "../../constants";

export function getPathToOutputDirectoriesFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(APPROVED_DIRECTORIES_FILENAME)
    );
}
