import { assertNever } from "@fern-api/core-utils";
import { Directory, SourceFile } from "ts-morph";
import { getOrCreateSourceFile } from "../file-system/getOrCreateSourceFile";
import { getParentDirectory, getRelativePathAsModuleSpecifierTo } from "../utils/getRelativePathAsModuleSpecifierTo";

export type ExportStrategy = { type: "all" } | { type: "namespace"; namespaceExport: string };

export function exportFromModule(
    toExport: SourceFile | Directory,
    exportStrategy: ExportStrategy = { type: "all" }
): void {
    const indexTsOfParent = getOrCreateSourceFile(getParentDirectory(toExport), "index.ts");
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(indexTsOfParent, toExport);
    switch (exportStrategy.type) {
        case "all":
            indexTsOfParent.addExportDeclaration({
                moduleSpecifier,
            });
            break;
        case "namespace":
            indexTsOfParent.addExportDeclaration({
                namespaceExport: exportStrategy.namespaceExport,
                moduleSpecifier,
            });
            break;
        default:
            assertNever(exportStrategy);
    }
}
