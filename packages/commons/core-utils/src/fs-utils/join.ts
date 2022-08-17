import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function join(first: RelativeFilePath, ...rest: RelativeFilePath[]): RelativeFilePath;
export function join(first: AbsoluteFilePath, ...rest: RelativeFilePath[]): AbsoluteFilePath;
export function join(...paths: (AbsoluteFilePath | RelativeFilePath)[]): AbsoluteFilePath | RelativeFilePath {
    return path.join(...paths) as AbsoluteFilePath | RelativeFilePath;
}
