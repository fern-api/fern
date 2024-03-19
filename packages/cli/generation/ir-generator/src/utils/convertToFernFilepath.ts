import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { dirname, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-api/ir-sdk";
import path, { basename } from "path";
import { CasingsGenerator } from "../casings/CasingsGenerator";

export function convertToFernFilepath({
    relativeFilepath,
    casingsGenerator
}: {
    relativeFilepath: RelativeFilePath;
    casingsGenerator: CasingsGenerator;
}): FernFilepath {
    const pathToPackage = dirname(relativeFilepath);
    const filename = basename(relativeFilepath);

    const packagePath =
        pathToPackage === "." ? [] : pathToPackage.split(path.sep).map((part) => casingsGenerator.generateName(part));

    const file =
        filename !== FERN_PACKAGE_MARKER_FILENAME
            ? casingsGenerator.generateName(path.parse(filename).name)
            : undefined;

    const allParts = [];
    allParts.push(...packagePath);
    if (file != null) {
        allParts.push(file);
    }

    return {
        allParts,
        packagePath,
        file
    };
}
