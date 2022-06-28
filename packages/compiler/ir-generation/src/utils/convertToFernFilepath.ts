import { RelativeFilePath } from "@fern-api/compiler-commons";
import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";

export function convertToFernFilepath(relativeFilepath: RelativeFilePath): FernFilepath {
    const parsed = path.parse(relativeFilepath);
    return FernFilepath.of(path.join(parsed.dir, parsed.name));
}
