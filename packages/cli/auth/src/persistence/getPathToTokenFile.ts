import { homedir } from "os";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

const TOKEN_FILENAME = "token";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export function getPathToTokenFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(TOKEN_FILENAME)
    );
}
