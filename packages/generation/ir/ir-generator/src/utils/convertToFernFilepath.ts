import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";
import { generateStringWithAllCasings } from "./generateCasings";

export function convertToFernFilepath(relativeFilepath: string): FernFilepath {
    return relativeFilepath
        .split(path.sep)
        .map((fileOrDir) => generateStringWithAllCasings(path.parse(fileOrDir).name));
}
