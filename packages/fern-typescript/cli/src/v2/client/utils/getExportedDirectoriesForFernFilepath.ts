import { FernFilepath } from "@fern-fern/ir-model";
import { camelCase } from "lodash-es";
import { ExportedFilePathPart } from "../../exports-manager/ExportedFilePath";

export const ROOT_API_DIRECTORY = "/api";

export function getExportedDirectoriesForFernFilepath(fernFilepath: FernFilepath): ExportedFilePathPart[] {
    return [
        {
            nameOnDisk: ROOT_API_DIRECTORY,
        },
        ...fernFilepath.map((fernFilepathPart) => ({
            nameOnDisk: fernFilepathPart,
            exportDeclaration: { namespaceExport: camelCase(fernFilepathPart) },
        })),
    ];
}
