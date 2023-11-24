import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { mapKeys } from "lodash-es";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";

export function getAllNamedDefinitionFiles(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<DefinitionFileSchema>> {
    return {
        ...definition.namedDefinitionFiles,
        ...entries(definition.importedDefinitions).reduce((acc, [pathToImportedDefinition, definition]) => {
            return {
                ...acc,
                ...mapKeys(getAllNamedDefinitionFiles(definition), (_file, path) =>
                    join(pathToImportedDefinition, RelativeFilePath.of(path))
                )
            };
        }, {})
    };
}
