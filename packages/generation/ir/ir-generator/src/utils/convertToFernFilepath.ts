import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";

export function convertToFernFilepath(relativeFilepath: string): FernFilepath {
    return relativeFilepath.split(path.sep).map((fileOrDir) => path.parse(fileOrDir).name);
}
