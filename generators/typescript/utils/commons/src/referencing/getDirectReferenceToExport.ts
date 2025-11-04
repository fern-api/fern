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

    let localName: string | undefined;
    let importAdded = false;

    const ensureImportAdded = () => {
        if (importAdded) {
            return;
        }
        importAdded = true;

        if (importAlias != null) {
            importsManager.addImport(moduleSpecifier, {
                namedImports: [
                    {
                        name: NamedExport.getName(exportedName),
                        alias: importAlias !== exportedName ? importAlias : undefined,
                        type: NamedExport.isTypeExport(exportedName) ? "type" : undefined
                    }
                ]
            });
            localName = importAlias;
        } else {
            localName = importsManager.ensureNamedImport({
                moduleSpecifier,
                name: NamedExport.getName(exportedName),
                isTypeOnly: NamedExport.isTypeExport(exportedName)
            });
        }
    };

    const getImportedName = () => {
        ensureImportAdded();
        return localName!;
    };

    const entityName = subImport.reduce<ts.EntityName>(
        (acc, subImport) => ts.factory.createQualifiedName(acc, subImport),
        ts.factory.createIdentifier(NamedExport.getName(getImportedName()))
    );

    return {
        getTypeNode: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                ensureImportAdded();
            }
            return ts.factory.createTypeReferenceNode(entityName);
        },
        getEntityName: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                ensureImportAdded();
            }
            return entityName;
        },
        getExpression: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                ensureImportAdded();
            }
            return ts.factory.createIdentifier(getImportedName());
        }
    };
}
