import { FernFilepath, StringWithAllCasings } from "@fern-fern/ir-model/commons";
import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";
import { ExportDeclaration } from "../../exports-manager/ExportsManager";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports,
}: {
    fernFilepath: FernFilepath;
    subExports?: Record<string, ExportDeclaration>;
}): ExportedDirectory[] {
    return fernFilepath.flatMap((fernFilepathPart, index) => [
        {
            nameOnDisk: "resources",
            exportDeclaration: { exportAll: true },
        },
        index === fernFilepath.length - 1
            ? createExportForFernFilepathFile(fernFilepathPart, subExports)
            : createExportForFernFilepathDirectory(fernFilepathPart),
    ]);
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
