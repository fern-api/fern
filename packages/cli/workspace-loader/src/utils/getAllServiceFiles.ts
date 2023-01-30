import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { mapKeys } from "lodash-es";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";

export function getAllServiceFiles(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<ServiceFileSchema>> {
    return {
        ...definition.serviceFiles,
        ...definition.packageMarkers,
        ...entries(definition.importedDefinitions).reduce((acc, [pathToImportedDefinition, definition]) => {
            return {
                ...acc,
                ...mapKeys(getAllServiceFiles(definition), (_serviceFile, path) =>
                    join(pathToImportedDefinition, RelativeFilePath.of(path))
                ),
            };
        }, {}),
    };
}
