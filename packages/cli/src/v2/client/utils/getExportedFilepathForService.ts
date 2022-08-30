import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForService } from "./getFileNameForService";

export function getExportedFilepathForService(serviceName: DeclaredServiceName, apiName: string): ExportedFilePath {
    return {
        directories: [
            ...getExportedDirectoriesForFernFilepath({ fernFilepath: serviceName.fernFilepath, apiName }),
            {
                nameOnDisk: "client",
                exportDeclaration: { exportAll: true },
            },
        ],
        file: {
            nameOnDisk: getFileNameForService(serviceName),
        },
    };
}
