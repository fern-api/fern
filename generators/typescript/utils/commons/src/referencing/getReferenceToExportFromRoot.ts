import { SourceFile, ts } from "ts-morph";

import {
    ExportedDirectory,
    ExportedFilePath,
    convertExportedDirectoryPathToFilePath,
    convertExportedFilePathToFilePath
} from "../exports-manager/ExportedFilePath";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "./ModuleSpecifier";
import { GetReferenceOpts, Reference } from "./Reference";
import { getDirectReferenceToExport } from "./getDirectReferenceToExport";
import { getEntityNameOfDirectory } from "./getEntityNameOfDirectory";
import { getExpressionToDirectory } from "./getExpressionToDirectory";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export declare namespace getReferenceToExportFromRoot {
    export interface Args {
        referencedIn: SourceFile;
        exportedName: string;
        exportedFromPath: ExportedFilePath;
        importsManager: ImportsManager;
        namespaceImport?: string;
        useDynamicImport?: boolean;
        subImport?: string[];
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    importsManager,
    referencedIn,
    namespaceImport,
    useDynamicImport = false,
    subImport = []
}: getReferenceToExportFromRoot.Args): Reference {
    let prefix: ts.Identifier | undefined;
    let moduleSpecifier: ModuleSpecifier;
    let directoriesInsideNamespaceExport: ExportedDirectory[];
    let addImport: () => void;

    const [firstDirectory, ...remainingDirectories] = exportedFromPath.directories;

    // if there's a default export, just use that
    if (firstDirectory?.exportDeclaration?.defaultExport != null) {
        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to: convertExportedDirectoryPathToFilePath([])
        });

        const { recommendedImportName } = firstDirectory.exportDeclaration.defaultExport;

        addImport = () => {
            importsManager.addImport(`${moduleSpecifier}/index`, { defaultImport: recommendedImportName });
        };

        prefix = ts.factory.createIdentifier(recommendedImportName);
        directoriesInsideNamespaceExport = remainingDirectories;
    }

    // if the namespaceImport arg is provided,
    // just: import * as namespaceImport from <first directory>;
    else if (namespaceImport != null) {
        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to:
                firstDirectory != null
                    ? convertExportedDirectoryPathToFilePath([firstDirectory])
                    : convertExportedFilePathToFilePath(exportedFromPath)
        });

        addImport = () => {
            importsManager.addImport(`${moduleSpecifier}/index`, { namespaceImport });
        };

        prefix = ts.factory.createIdentifier(namespaceImport);
        directoriesInsideNamespaceExport = remainingDirectories;
    }

    // otherwise, import directly from the first namespace-exported directory
    else {
        const directoryToImportDirectlyFrom: ExportedDirectory[] = [];

        // find the first namespace-exported directory
        for (const [index, directory] of exportedFromPath.directories.entries()) {
            // never import from root index.ts (to avoid circular dependencies)
            if (index > 0 && directory.exportDeclaration?.namespaceExport != null) {
                break;
            }
            directoryToImportDirectlyFrom.push(directory);
        }

        directoriesInsideNamespaceExport = exportedFromPath.directories.slice(directoryToImportDirectlyFrom.length);
        const firstDirectoryInsideNamespaceExport = directoriesInsideNamespaceExport[0];

        // if there's no namespace exports in the directory path, then just import
        // directly from the file
        if (firstDirectoryInsideNamespaceExport?.exportDeclaration?.namespaceExport == null) {
            return getDirectReferenceToExport({
                exportedName,
                exportedFromPath,
                importsManager,
                referencedIn,
                importAlias: undefined,
                subImport
            });
        }

        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to: convertExportedDirectoryPathToFilePath(directoryToImportDirectlyFrom)
        });

        const namedImport = firstDirectoryInsideNamespaceExport.exportDeclaration.namespaceExport;
        addImport = () => {
            importsManager.addImport(`${moduleSpecifier}/index`, {
                namedImports: [namedImport]
            });
        };
    }

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        getEntityNameOfDirectory({
            pathToDirectory: directoriesInsideNamespaceExport,
            prefix
        })
    );

    const expression = [exportedName, ...subImport].reduce<ts.Expression>(
        (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
        getExpressionToDirectory({
            pathToDirectory: directoriesInsideNamespaceExport,
            prefix: useDynamicImport
                ? ts.factory.createParenthesizedExpression(
                      ts.factory.createAwaitExpression(
                          ts.factory.createCallExpression(ts.factory.createIdentifier("import"), undefined, [
                              ts.factory.createStringLiteral(moduleSpecifier)
                          ])
                      )
                  )
                : prefix
        })
    );

    const typeNode = ts.factory.createTypeReferenceNode(entityName);

    return {
        getTypeNode: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return typeNode;
        },
        getEntityName: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!isForComment) {
                addImport();
            }
            return entityName;
        },
        getExpression: ({ isForComment = false }: GetReferenceOpts = {}) => {
            if (!useDynamicImport && !isForComment) {
                addImport();
            }
            return expression;
        }
    };
}
