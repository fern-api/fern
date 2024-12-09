import { RelativeFilePath } from "@fern-api/path-utils";
import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { ParsedFernFile } from "../FernFile";
import { FernDefinition } from "../AbstractAPIWorkspace";
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
