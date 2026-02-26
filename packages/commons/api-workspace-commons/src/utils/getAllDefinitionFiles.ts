import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { FernDefinition } from "../AbstractAPIWorkspace.js";
import { ParsedFernFile } from "../FernFile.js";
import { getAllNamedDefinitionFiles } from "./getAllNamedDefinitionFiles.js";
import { getAllPackageMarkers } from "./getAllPackageMarkers.js";

export function getAllDefinitionFiles(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<DefinitionFileSchema>> {
    return {
        ...getAllPackageMarkers(definition),
        ...getAllNamedDefinitionFiles(definition)
    };
}
