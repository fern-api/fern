import { AbsoluteFilePath } from "./AbsoluteFilePath.js";

export function cwd(): AbsoluteFilePath {
    return process.cwd() as AbsoluteFilePath;
}
