import { FernFilepath } from "@fern-api/api";
import path from "path";
import { RelativeFilePath } from "../packages/compiler/commons/src";

export function convertToFernFilepath(relativeFilepath: RelativeFilePath): FernFilepath {
    const parsed = path.parse(relativeFilepath);
    return FernFilepath.of(path.join(parsed.dir, parsed.name));
}
