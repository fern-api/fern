import { RelativeFilePath } from "@fern-api/fs-utils";

import { FernFilepath, Name } from "@fern-fern/ir-sdk/api";

import { ExportDeclaration } from "../exports-manager";
import { ExportedDirectory } from "../exports-manager/ExportedFilePath";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports
}: {
    fernFilepath: FernFilepath;
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
    fernFilepathPart: Name,
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
