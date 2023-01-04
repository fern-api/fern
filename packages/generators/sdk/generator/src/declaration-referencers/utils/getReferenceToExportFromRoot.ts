import { GetReferenceOpts, Reference } from "@fern-typescript/contexts";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedDirectoryPathToFilePath,
    convertExportedFilePathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../../exports-manager/ExportedFilePath";
import { ImportsManager } from "../../imports-manager/ImportsManager";
import { getRelativePathAsModuleSpecifierTo } from "../../utils/getRelativePathAsModuleSpecifierTo";
import { ModuleSpecifier } from "../../utils/ModuleSpecifier";
import { getDirectReferenceToExport } from "./getDirectReferenceToExport";
import { getEntityNameOfDirectory } from "./getEntityNameOfDirectory";
import { getExpressionToDirectory } from "./getExpressionToDirectory";

export declare namespace getReferenceToExportFromRoot {
    export interface Args {
        referencedIn: SourceFile;
        exportedName: string;
        exportedFromPath: ExportedFilePath;
        importsManager: ImportsManager;
        namespaceImport?: string;
        useDynamicImport?: boolean;
        subImport?: string[];
        packageName: string;
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    importsManager,
    referencedIn,
    namespaceImport,
    useDynamicImport = false,
    subImport = [],
    packageName,
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
            to: convertExportedDirectoryPathToFilePath([]),
            packageName,
        });

        const { recommendedImportName } = firstDirectory.exportDeclaration.defaultExport;

        addImport = () => {
            importsManager.addImport(moduleSpecifier, { defaultImport: recommendedImportName });
        };

        prefix = ts.factory.createIdentifier(recommendedImportName);
        directoriesInsideNamespaceExport = remainingDirectories;
    }

    // if the item we're importing has no namespaceExport, but the namespaceImport arg is provided,
    // just: import * as namespaceImport from <root>;
    else if (firstDirectory?.exportDeclaration?.namespaceExport == null && namespaceImport != null) {
        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to:
                firstDirectory != null
                    ? convertExportedDirectoryPathToFilePath([firstDirectory])
                    : convertExportedFilePathToFilePath(exportedFromPath),
            packageName,
        });

        addImport = () => {
            importsManager.addImport(moduleSpecifier, { namespaceImport });
        };

        prefix = ts.factory.createIdentifier(namespaceImport);
        directoriesInsideNamespaceExport = remainingDirectories;
    }

    // otherwise, import directly from the first namespace-exported directory
    else {
        const directoryToImportDirectlyFrom: ExportedDirectory[] = [];

        // find the first namespace-exported directory
        for (const directory of exportedFromPath.directories) {
            if (directory.exportDeclaration?.namespaceExport != null) {
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
                subImport,
                packageName,
            });
        }

        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to: convertExportedDirectoryPathToFilePath(directoryToImportDirectlyFrom),
            packageName,
        });

        const namedImport = firstDirectoryInsideNamespaceExport.exportDeclaration.namespaceExport;
        addImport = () => {
            importsManager.addImport(moduleSpecifier, {
                namedImports: [namedImport],
            });
        };
    }

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        getEntityNameOfDirectory({
            pathToDirectory: directoriesInsideNamespaceExport,
            prefix,
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
                              ts.factory.createStringLiteral(moduleSpecifier),
                          ])
                      )
                  )
                : prefix,
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
        },
    };
}
