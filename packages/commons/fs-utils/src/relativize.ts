import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export async function relativize(fromPath: AbsoluteFilePath, toPath: AbsoluteFilePath): Promise<RelativeFilePath> {
    return RelativeFilePath.of(path.relative(fromPath, toPath));
}
