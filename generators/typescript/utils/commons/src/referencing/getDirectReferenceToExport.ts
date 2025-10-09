import { SourceFile, ts } from "ts-morph";

import { ExportedFilePath, ExportsManager, NamedExport } from "../exports-manager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";
import { GetReferenceOpts, Reference } from "./Reference";

export function getDirectReferenceToExport({
    exportedName,
    exportedFromPath,
    importsManager,
    exportsManager,
    referencedIn,
    importAlias,
    subImport = []
}: {
    exportedName: NamedExport;
    exportedFromPath: ExportedFilePath;
    importsManager: ImportsManager;
    exportsManager: ExportsManager;
    referencedIn: SourceFile;
    importAlias: string | undefined;
    subImport?: string[];
}): Reference {
    const moduleSpecifier = getRelativePathAsModuleSpecifierTo({
        from: referencedIn,
        to: exportsManager.convertExportedFilePathToFilePath(exportedFromPath)
    });

    const addImport = () => {
        importsManager.addImport(moduleSpecifier, {
            namedImports: [
                {
                    name: NamedExport.getName(exportedName),
                    alias: importAlias !== exportedName ? importAlias : undefined,
                    type: NamedExport.isTypeExport(exportedName) ? "type" : undefined
                }
            ]
        });
    };

    const importedName = importAlias ?? exportedName;

    const entityName = subImport.reduce<ts.EntityName>(
        (acc, subImport) => ts.factory.createQualifiedName(acc, subImport),
        ts.factory.createIdentifier(NamedExport.getName(importedName))
    );

    return {
        getTypeNode: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return ts.factory.createTypeReferenceNode(entityName);
        },
        getEntityName: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return entityName;
        },
        getExpression: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return ts.factory.createIdentifier(NamedExport.getName(importedName));
        }
    };
}
