import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { homedir } from "os";

const APPROVED_OUTPUT_DIRECTORIES_FILENAME = "approved-output-directories";
const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";

export function getPathToOutputDirectoriesFile(): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(APPROVED_OUTPUT_DIRECTORIES_FILENAME)
    );
}
