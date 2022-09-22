import { RelativeFilePath } from "@fern-api/core-utils";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForType } from "./getFileNameForType";

const ERRORS_DIRECTORY_NAME = "errors";

export function getExportedFilepathForError(errorName: DeclaredErrorName, apiName: string): ExportedFilePath {
    return {
        directories: [
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: errorName.fernFilepath,
                apiName,
                subExports: {
                    [RelativeFilePath.of(ERRORS_DIRECTORY_NAME)]: {
                        exportAll: true,
                    },
                },
            }),
            {
                nameOnDisk: ERRORS_DIRECTORY_NAME,
                exportDeclaration: { exportAll: true },
            },
        ],
        file: {
            nameOnDisk: getFileNameForType(errorName),
            exportDeclaration: { exportAll: true },
        },
    };
}
