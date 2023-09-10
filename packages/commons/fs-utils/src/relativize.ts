import path from "path";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { RelativeFilePath } from "./RelativeFilePath";

export async function relativize(one: AbsoluteFilePath, two: AbsoluteFilePath): Promise<RelativeFilePath> {
    return RelativeFilePath.of(path.relative(one, two));
}
