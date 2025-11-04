import { SourceFile, ts } from "ts-morph";

import { ExportedFilePath, ExportsManager, NamedExport } from "../exports-manager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { getReferenceToExportFromRoot } from "./getReferenceToExportFromRoot";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";
import { GetReferenceOpts, Reference } from "./Reference";

export function getDirectReferenceToExport({
    exportedName,
    exportedFromPath,
    importsManager,
    exportsManager,
    referencedIn,
    importAlias,
    subImport = [],
    aliasSuffix
}: {
    exportedName: NamedExport;
    exportedFromPath: ExportedFilePath;
    importsManager: ImportsManager;
    exportsManager: ExportsManager;
    referencedIn: SourceFile;
    importAlias: string | undefined;
    subImport?: string[];
    aliasSuffix?: string;
}): Reference {
    const exportedFilePath = exportsManager.convertExportedFilePathToFilePath(exportedFromPath);
    const referencedInPath = referencedIn.getFilePath();

    const isSelfImport = exportedFilePath === referencedInPath;

    if (isSelfImport) {
        return getReferenceToExportFromRoot({
            exportedName,
            exportedFromPath,
            importsManager,
            exportsManager,
            referencedIn,
            subImport
        });
    }

    const moduleSpecifier = getRelativePathAsModuleSpecifierTo({
        from: referencedIn,
        to: exportedFilePath
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
                isTypeOnly: NamedExport.isTypeExport(exportedName),
                aliasSuffix
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
