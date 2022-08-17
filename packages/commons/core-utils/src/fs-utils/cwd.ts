import { AbsoluteFilePath } from "./AbsoluteFilePath";

export function cwd(): AbsoluteFilePath {
    return AbsoluteFilePath.of(process.cwd());
}
