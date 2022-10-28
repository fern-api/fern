import { FernFilepathV2, Name } from "@fern-fern/ir-model/commons";
import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";
import { ExportDeclaration } from "../../exports-manager/ExportsManager";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports,
}: {
    fernFilepath: FernFilepathV2;
    subExports?: Record<string, ExportDeclaration>;
}): ExportedDirectory[] {
    return fernFilepath.flatMap((fernFilepathPart, index) => {
        const directories: ExportedDirectory[] = [];
        if (index > 0) {
            directories.push({
                nameOnDisk: "resources",
                exportDeclaration: { exportAll: true },
            });
        }
        if (index < fernFilepath.length - 1) {
            directories.push(createExportForFernFilepathDirectory(fernFilepathPart));
        } else {
            directories.push(createExportForFernFilepathFile(fernFilepathPart, subExports));
        }
        return directories;
    });
}

export function createExportForFernFilepathDirectory(fernFilepathPart: Name): ExportedDirectory {
    return {
        nameOnDisk: fernFilepathPart.unsafeName.camelCase,
        exportDeclaration: { namespaceExport: fernFilepathPart.safeName.camelCase },
    };
}

export function createExportForFernFilepathFile(
    fernFilepathPart: Name,
    subExports?: Record<string, ExportDeclaration>
): ExportedDirectory {
    return {
        ...createExportForFernFilepathDirectory(fernFilepathPart),
        subExports,
    };
}
