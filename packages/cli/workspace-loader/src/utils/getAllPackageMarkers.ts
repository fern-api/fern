import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { PackageMarkerFileSchema } from "@fern-api/yaml-schema";
import { mapKeys } from "lodash-es";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";

export function getAllPackageMarkers(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> {
    return {
        ...definition.packageMarkers,
        ...entries(definition.importedDefinitions).reduce((acc, [pathToImportedDefinition, definition]) => {
            return {
                ...acc,
                ...mapKeys(getAllPackageMarkers(definition), (_file, path) =>
                    join(pathToImportedDefinition, RelativeFilePath.of(path))
                )
            };
        }, {})
    };
}
