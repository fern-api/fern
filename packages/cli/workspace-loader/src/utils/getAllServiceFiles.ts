import { RelativeFilePath } from "@fern-api/fs-utils";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "../types/FernFile";
import { Workspace } from "../types/Workspace";

export function getAllServiceFiles(workspace: Workspace): Record<RelativeFilePath, ParsedFernFile<ServiceFileSchema>> {
    return {
        ...workspace.serviceFiles,
        ...workspace.importedServiceFiles,
        ...workspace.packageMarkers,
    };
}
