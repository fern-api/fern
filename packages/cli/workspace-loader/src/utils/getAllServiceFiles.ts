import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "../types/FernFile";
import { FernDefinition } from "../types/Workspace";

export function getAllServiceFiles(
    definition: FernDefinition
): Record<RelativeFilePath, ParsedFernFile<ServiceFileSchema>> {
    return {
        ...definition.serviceFiles,
        ...definition.importedServiceFiles,
        ...definition.packageMarkers,
    };
}
