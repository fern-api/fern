import { ServiceName } from "@fern-fern/ir-model/services";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForService } from "./getFileNameForService";

export function getExportedFilepathForService(serviceName: ServiceName, apiName: string): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(serviceName.fernFilepath, apiName),
        file: {
            nameOnDisk: getFileNameForService(serviceName),
            exportDeclaration: { exportAll: true },
        },
    };
}
