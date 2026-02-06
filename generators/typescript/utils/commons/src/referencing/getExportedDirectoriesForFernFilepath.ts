import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { ExportDeclaration, ExportedDirectory } from "../exports-manager/index.js";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports
}: {
    fernFilepath: FernIr.FernFilepath;
    subExports?: Record<RelativeFilePath, ExportDeclaration>;
}): ExportedDirectory[] {
    const directories = [
        ...fernFilepath.packagePath.flatMap((fernFilepathPart) =>
            getExportedDirectoriesForFernFilepathPart(fernFilepathPart)
        )
    ];
    if (fernFilepath.file != null) {
        directories.push(...getExportedDirectoriesForFernFilepathPart(fernFilepath.file, { subExports }));
    }
    return directories;
}

function getExportedDirectoriesForFernFilepathPart(
    fernFilepathPart: FernIr.Name,
    { subExports }: { subExports?: Record<string, ExportDeclaration> } = {}
): ExportedDirectory[] {
    return [
        {
            nameOnDisk: "resources",
            exportDeclaration: { exportAll: true }
        },
        {
            nameOnDisk: fernFilepathPart.camelCase.unsafeName,
            exportDeclaration: { namespaceExport: fernFilepathPart.camelCase.safeName },
            subExports
        }
    ];
}
