import { CaseConverter } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { ExportDeclaration, ExportedDirectory } from "../exports-manager/index.js";

export function getExportedDirectoriesForFernFilepath({
    fernFilepath,
    subExports,
    caseConverter
}: {
    fernFilepath: FernIr.FernFilepath;
    subExports?: Record<RelativeFilePath, ExportDeclaration>;
    caseConverter: CaseConverter;
}): ExportedDirectory[] {
    const directories = [
        ...fernFilepath.packagePath.flatMap((fernFilepathPart) =>
            getExportedDirectoriesForFernFilepathPart(fernFilepathPart, {}, caseConverter)
        )
    ];
    if (fernFilepath.file != null) {
        directories.push(
            ...getExportedDirectoriesForFernFilepathPart(fernFilepath.file, { subExports }, caseConverter)
        );
    }
    return directories;
}

function getExportedDirectoriesForFernFilepathPart(
    fernFilepathPart: FernIr.NameOrString,
    { subExports }: { subExports?: Record<string, ExportDeclaration> } = {},
    caseConverter: CaseConverter
): ExportedDirectory[] {
    return [
        {
            nameOnDisk: "resources",
            exportDeclaration: { exportAll: true }
        },
        {
            nameOnDisk: caseConverter.camelUnsafe(fernFilepathPart),
            exportDeclaration: { namespaceExport: caseConverter.camelSafe(fernFilepathPart) },
            subExports
        }
    ];
}
