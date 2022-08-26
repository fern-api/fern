import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForService } from "./getFileNameForService";

export function getExportedFilepathForService(serviceName: DeclaredServiceName, apiName: string): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(serviceName.fernFilepath, apiName),
        file: {
            nameOnDisk: getFileNameForService(serviceName),
            exportDeclaration: { exportAll: true },
        },
    };
}
