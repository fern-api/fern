import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";

export function getFilepathForFernFilepath(fernFilepath: FernFilepath): string {
    return path.join(...fernFilepath);
}
