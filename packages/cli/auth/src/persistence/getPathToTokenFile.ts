import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { homedir } from "os";

const TOKEN_FILENAME = "token";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export function getPathToTokenFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(TOKEN_FILENAME)
    );
}
