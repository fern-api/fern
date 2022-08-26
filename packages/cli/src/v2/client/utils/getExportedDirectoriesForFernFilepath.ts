import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ExportedFilePathPart } from "../../exports-manager/ExportedFilePath";

export const ROOT_API_DIRECTORY = "/api";

export function getExportedDirectoriesForFernFilepath(
    fernFilepath: FernFilepath,
    apiName: string
): ExportedFilePathPart[] {
    return [
        {
            nameOnDisk: ROOT_API_DIRECTORY,
            exportDeclaration: { namespaceExport: apiName },
        },
        ...fernFilepath.map((fernFilepathPart) => ({
            nameOnDisk: fernFilepathPart.originalValue,
            exportDeclaration: { namespaceExport: fernFilepathPart.camelCase },
        })),
    ];
}
