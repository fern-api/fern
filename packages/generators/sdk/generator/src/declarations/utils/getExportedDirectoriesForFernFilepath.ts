import { FernFilepath, StringWithAllCasings } from "@fern-fern/ir-model/commons";
import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";
import { ExportDeclaration } from "../../exports-manager/ExportsManager";

export const ROOT_API_DIRECTORY = "/api";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    apiName,
    subExports,
}: {
    fernFilepath: FernFilepath;
    apiName: string;
    subExports?: Record<string, ExportDeclaration>;
}): ExportedDirectory[] {
    return [
        createRootApiFilePathPart(apiName),
        ...fernFilepath.map((fernFilepathPart, index) =>
            index === fernFilepath.length - 1
                ? createExportForFernFilepathFile(fernFilepathPart, subExports)
                : createExportForFernFilepathDirectory(fernFilepathPart)
        ),
    ];
}

export function createRootApiFilePathPart(apiName: string): ExportedDirectory {
    return {
        nameOnDisk: ROOT_API_DIRECTORY,
        exportDeclaration: { namespaceExport: apiName },
    };
}

export function createExportForFernFilepathDirectory(fernFilepathPart: StringWithAllCasings): ExportedDirectory {
    return {
        nameOnDisk: fernFilepathPart.originalValue,
        exportDeclaration: { namespaceExport: fernFilepathPart.camelCase },
    };
}

export function createExportForFernFilepathFile(
    fernFilepathPart: StringWithAllCasings,
    subExports?: Record<string, ExportDeclaration>
): ExportedDirectory {
    return {
        nameOnDisk: fernFilepathPart.originalValue,
        exportDeclaration: {
            namespaceExport: fernFilepathPart.camelCase,
        },
        subExports,
    };
}
