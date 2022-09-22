import { WrapperName } from "@fern-typescript/commons-v2";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { createRootApiFilePathPart } from "../utils/createRootApiFilePathPart";
import { createExportForFernFilepathDirectory } from "../utils/getExportedDirectoriesForFernFilepath";
import { getFileNameForWrapper } from "./getFileNameForWrapper";

export function getExportedFilepathForWrapper(wrapperName: WrapperName, apiName: string): ExportedFilePath {
    return {
        directories: [
            createRootApiFilePathPart(apiName),
            ...wrapperName.fernFilepath.map(createExportForFernFilepathDirectory),
        ],
        file: {
            nameOnDisk: getFileNameForWrapper(wrapperName),
            exportDeclaration: wrapperName.isRootWrapper ? { exportAll: true } : undefined,
        },
    };
}
