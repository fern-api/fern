import { entries } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { PackageMarkerFileSchema } from "@fern-api/yaml-schema";
import { mapKeys } from "lodash-es";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";

export declare namespace getAllPackageMarkers {
    interface Opts {
        defaultURL?: string;
    }
}

export function getAllPackageMarkers(
    definition: FernDefinition,
    opts: getAllPackageMarkers.Opts = {}
): Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>> {
    return {
        ...Object.fromEntries(
            entries(definition.packageMarkers).map(([path, file]) => {
                return [path, { ...file, defaultUrl: opts.defaultURL }];
            })
        ),
        ...entries(definition.importedDefinitions).reduce((acc, [pathToImportedDefinition, definition]) => {
            return {
                ...acc,
                ...mapKeys(getAllPackageMarkers(definition.definition, { defaultURL: definition.url }), (_file, path) =>
                    join(pathToImportedDefinition, RelativeFilePath.of(path))
                )
            };
        }, {})
    };
}
