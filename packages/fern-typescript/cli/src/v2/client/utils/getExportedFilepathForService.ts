import { ServiceName } from "@fern-fern/ir-model/services";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForService } from "./getFileNameForService";
import { getGeneratedServiceName } from "./getGeneratedServiceName";

export function getExportedFilepathForService(serviceName: ServiceName): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(serviceName.fernFilepath),
        file: {
            nameOnDisk: getFileNameForService(serviceName),
            exportDeclaration: { namespaceExport: getGeneratedServiceName(serviceName) },
        },
    };
}
