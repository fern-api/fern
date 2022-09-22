import { RelativeFilePath } from "@fern-api/core-utils";
import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getFileNameForType } from "../types/getFileNameForType";
import { createRootApiFilePathPart } from "../utils/createRootApiFilePathPart";
import { getExportedDirectoriesForFernFilepath } from "../utils/getExportedDirectoriesForFernFilepath";

const ERRORS_DIRECTORY_NAME = "errors";

export function getExportedFilepathForError(errorName: DeclaredErrorName, apiName: string): ExportedFilePath {
    return {
        directories: [
            createRootApiFilePathPart(apiName),
            ...getExportedDirectoriesForFernFilepath({
                fernFilepath: errorName.fernFilepath,
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
