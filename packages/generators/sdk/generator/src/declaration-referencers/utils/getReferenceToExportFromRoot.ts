import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedDirectoryPathToFilePath,
    convertExportedFilePathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
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
        subImport?: string[];
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    addImport,
    referencedIn,
    namespaceImport,
    subImport = [],
}: getReferenceToExportFromRoot.Args): Reference {
    let prefix: ts.Identifier | undefined;
    let directoriesInsideNamespaceExport: ExportedDirectory[];

    if (exportedFromPath.directories[0]?.exportDeclaration?.namespaceExport == null && namespaceImport != null) {
        const [firstDirectory, ...remainingDirectories] = exportedFromPath.directories;
        const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
            referencedIn,
            firstDirectory != null
                ? convertExportedDirectoryPathToFilePath([firstDirectory])
                : convertExportedFilePathToFilePath(exportedFromPath)
        );
        addImport(moduleSpecifier, { namespaceImport });

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
                addImport,
                referencedIn,
                importAlias: undefined,
                subImport,
            });
        }

        const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToImportDirectlyFrom)
        );
        addImport(moduleSpecifier, {
            namedImports: [firstDirectoryInsideNamespaceExport.exportDeclaration.namespaceExport],
        });
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
            prefix,
        })
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression,
    };
}
