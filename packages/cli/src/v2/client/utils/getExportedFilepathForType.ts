import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForType } from "./getFileNameForType";

export function getExportedFilepathForType(typeName: DeclaredTypeName, apiName: string): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(typeName.fernFilepath, apiName),
        file: {
            nameOnDisk: getFileNameForType(typeName),
            exportDeclaration: { exportAll: true },
        },
    };
}
