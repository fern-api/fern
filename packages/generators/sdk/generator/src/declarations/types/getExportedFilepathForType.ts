import { RelativeFilePath } from "@fern-api/core-utils";
import { DeclaredTypeName } from "@fern-fern/ir-model/types";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "../utils/getExportedDirectoriesForFernFilepath";
import { getFileNameForType } from "./getFileNameForType";

export const TYPES_DIRECTORY_NAME = "types";

export function getExportedFilepathForType(typeName: DeclaredTypeName, apiName: string): ExportedFilePath {
    return {
        directories: [
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: typeName.fernFilepath,
                apiName,
                subExports: {
                    [RelativeFilePath.of(TYPES_DIRECTORY_NAME)]: {
                        exportAll: true,
                    },
                },
            }),
            {
                nameOnDisk: TYPES_DIRECTORY_NAME,
                exportDeclaration: { exportAll: true },
            },
        ],
        file: {
            nameOnDisk: getFileNameForType(typeName),
            exportDeclaration: { exportAll: true },
        },
    };
}
