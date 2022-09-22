import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { createRootApiFilePathPart } from "../utils/createRootApiFilePathPart";
import { getExportedDirectoriesForFernFilepath } from "../utils/getExportedDirectoriesForFernFilepath";
import { getFileNameForService } from "./getFileNameForService";

export function getExportedFilepathForService(serviceName: DeclaredServiceName, apiName: string): ExportedFilePath {
    return {
        directories: [
            createRootApiFilePathPart(apiName),
            ...getExportedDirectoriesForFernFilepath({ fernFilepath: serviceName.fernFilepath }),
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
