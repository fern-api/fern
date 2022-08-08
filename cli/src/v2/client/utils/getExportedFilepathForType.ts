import { DeclaredTypeName } from "@fern-fern/ir-model";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForType } from "./getFileNameForType";

export function getExportedFilepathForType(typeName: DeclaredTypeName): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(typeName.fernFilepath),
        file: {
            nameOnDisk: getFileNameForType(typeName),
            exportDeclaration: { exportAll: true },
        },
    };
}
