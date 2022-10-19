import { RelativeFilePath } from "@fern-api/core-utils";
import { FernFilepath, FernFilepathV2 } from "@fern-fern/ir-model/commons";
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
        .map((fileOrDir) => casingsGenerator.generateNameCasingsV1(path.parse(fileOrDir).name));
}

export function convertToFernFilepathV2({
    relativeFilepath,
    casingsGenerator,
}: {
    relativeFilepath: RelativeFilePath;
    casingsGenerator: CasingsGenerator;
}): FernFilepathV2 {
    return relativeFilepath
        .split(path.sep)
        .map((fileOrDir) => casingsGenerator.generateName(path.parse(fileOrDir).name));
}
