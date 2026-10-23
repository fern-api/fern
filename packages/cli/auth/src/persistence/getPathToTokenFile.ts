import { LOCAL_STORAGE_FOLDER } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { homedir } from "os";

const TOKEN_FILENAME = "token";

export function getPathToTokenFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(TOKEN_FILENAME)
    );
}
