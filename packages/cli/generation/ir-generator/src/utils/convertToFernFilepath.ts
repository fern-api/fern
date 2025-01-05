import { FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION } from "@fern-api/configuration";
import { FernFilepath } from "@fern-api/ir-sdk";
import { RelativeFilePath, basename, dirname, sep } from "@fern-api/path-utils";

import { CasingsGenerator } from "../casings/CasingsGenerator";

export function convertToFernFilepath({
    relativeFilepath,
    casingsGenerator
}: {
    relativeFilepath: RelativeFilePath;
    casingsGenerator: CasingsGenerator;
}): FernFilepath {
    const pathToPackage = dirname(relativeFilepath);
    const filename = basename(relativeFilepath, { stripExtension: true });

    const packagePath =
        pathToPackage === "." ? [] : pathToPackage.split(sep).map((part) => casingsGenerator.generateName(part));

    const file =
        filename !== FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION ? casingsGenerator.generateName(filename) : undefined;

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
