import { WrapperName } from "@fern-typescript/commons-v2";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getExportedDirectoriesForFernFilepath } from "./getExportedDirectoriesForFernFilepath";
import { getFileNameForWrapper } from "./getFileNameForWrapper";

export function getExportedFilepathForWrapper(wrapperName: WrapperName, apiName: string): ExportedFilePath {
    return {
        directories: getExportedDirectoriesForFernFilepath(wrapperName.fernFilepath, apiName),
        file: {
            nameOnDisk: getFileNameForWrapper(wrapperName),
            exportDeclaration: { exportAll: true },
        },
    };
}
