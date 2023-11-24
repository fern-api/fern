import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";
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
