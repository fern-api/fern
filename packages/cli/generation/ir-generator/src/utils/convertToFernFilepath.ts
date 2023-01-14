import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import path, { basename } from "path";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function convertToFernFilepath({
    relativeFilepath,
    casingsGenerator,
}: {
    relativeFilepath: RelativeFilePath;
    casingsGenerator: CasingsGenerator;
}): FernFilepath {
    const santizedPath =
        basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME ? dirname(relativeFilepath) : relativeFilepath;
    if (santizedPath === ".") {
        return [];
    }
    return santizedPath.split(path.sep).map((fileOrDir) => casingsGenerator.generateName(path.parse(fileOrDir).name));
}
