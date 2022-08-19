import { RelativeFilePath } from "@fern-api/core-utils";
import { FernFilepath } from "@fern-fern/ir-model";
import path from "path";
import { generateStringWithAllCasings } from "./generateCasings";

export function convertToFernFilepath(relativeFilepath: RelativeFilePath): FernFilepath {
    return relativeFilepath
        .split(path.sep)
        .map((fileOrDir) => generateStringWithAllCasings(path.parse(fileOrDir).name));
}
