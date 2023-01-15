import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ExportedDirectory } from "../../exports-manager/ExportedFilePath";
import { ExportDeclaration } from "../../exports-manager/ExportsManager";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports,
}: {
    fernFilepath: FernFilepath;
    subExports?: Record<RelativeFilePath, ExportDeclaration>;
}): ExportedDirectory[] {
    return fernFilepath.flatMap((fernFilepathPart, index) => {
        const directories: ExportedDirectory[] = [
            {
                nameOnDisk: "resources",
                exportDeclaration: { exportAll: true },
            },
        ];
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
        nameOnDisk: fernFilepathPart.camelCase.unsafeName,
        exportDeclaration: { namespaceExport: fernFilepathPart.camelCase.safeName },
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
