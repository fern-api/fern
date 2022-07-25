import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";

export function convertToFernFilepath(relativeFilepath: string): FernFilepath {
    const dirname = path.dirname(relativeFilepath);
    if (dirname === ".") {
        return [];
    }
    return dirname.split(path.sep);
}
