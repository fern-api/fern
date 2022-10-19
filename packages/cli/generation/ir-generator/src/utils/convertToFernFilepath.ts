import { RelativeFilePath } from "@fern-api/core-utils";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import path from "path";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function convertToFernFilepath({
    relativeFilepath,
    casingsGenerator,
}: {
    relativeFilepath: RelativeFilePath;
    casingsGenerator: CasingsGenerator;
}): FernFilepath {
    return relativeFilepath
        .split(path.sep)
        .map((fileOrDir) => casingsGenerator.generateNameCasings(path.parse(fileOrDir).name));
}
