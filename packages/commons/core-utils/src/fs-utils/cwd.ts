import { AbsoluteFilePath } from "./AbsoluteFilePath";

export function cwd(): AbsoluteFilePath {
    return process.cwd() as AbsoluteFilePath;
}
