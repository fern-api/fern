import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { FernDefinition } from "../AbstractAPIWorkspace";
import { ParsedFernFile } from "../FernFile";
import { getAllNamedDefinitionFiles } from "./getAllNamedDefinitionFiles";
import { getAllPackageMarkers } from "./getAllPackageMarkers";

export function getAllDefinitionFiles(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<DefinitionFileSchema>> {
    return {
        ...getAllPackageMarkers(definition),
        ...getAllNamedDefinitionFiles(definition)
    };
}
