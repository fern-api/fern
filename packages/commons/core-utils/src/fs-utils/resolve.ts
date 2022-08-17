import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export function resolve(first: AbsoluteFilePath, ...rest: (AbsoluteFilePath | RelativeFilePath)[]): AbsoluteFilePath;
export function resolve(...paths: (AbsoluteFilePath | RelativeFilePath)[]): AbsoluteFilePath | RelativeFilePath {
    return path.resolve(...paths) as AbsoluteFilePath | RelativeFilePath;
}
