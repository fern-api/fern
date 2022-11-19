import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedDirectoryPathToFilePath,
    convertExportedFilePathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
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
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        namespaceImport?: string;
        useDynamicImport?: boolean;
        subImport?: string[];
        packageName: string;
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    addImport: addImportToFile,
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

    if (exportedFromPath.directories[0]?.exportDeclaration?.namespaceExport == null && namespaceImport != null) {
        const [firstDirectory, ...remainingDirectories] = exportedFromPath.directories;
        moduleSpecifier = getRelativePathAsModuleSpecifierTo({
            from: referencedIn,
            to:
                firstDirectory != null
                    ? convertExportedDirectoryPathToFilePath([firstDirectory])
                    : convertExportedFilePathToFilePath(exportedFromPath),
            packageName,
        });

        addImport = () => {
            addImportToFile(moduleSpecifier, { namespaceImport });
        };

        prefix = ts.factory.createIdentifier(namespaceImport);
        directoriesInsideNamespaceExport = remainingDirectories;
    } else {
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
                addImport: addImportToFile,
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
            addImportToFile(moduleSpecifier, {
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
        getTypeNode: () => {
            addImport();
            return typeNode;
        },
        getEntityName: () => {
            addImport();
            return entityName;
        },
        getExpression: () => {
            if (!useDynamicImport) {
                addImport();
            }
            return expression;
        },
    };
}
