import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import {
    convertExportedDirectoryPathToFilePath,
    ExportedDirectory,
    ExportedFilePath,
} from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../utils/ModuleSpecifier";
import { getDirectReferenceToExport } from "./getDirectReferenceToExport";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";

export declare namespace getReferenceToExportFromRoot {
    export interface Args {
        referencedIn: SourceFile;
        exportedName: string;
        exportedFromPath: ExportedFilePath;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToExportFromRoot({
    exportedName,
    exportedFromPath,
    addImport,
    referencedIn,
}: getReferenceToExportFromRoot.Args): Reference {
    const directoryToImportDirectlyFrom: ExportedDirectory[] = [];

    // find the first namespace-exported directory
    for (const directory of exportedFromPath.directories) {
        if (directory.exportDeclaration?.namespaceExport != null) {
            break;
        }
        directoryToImportDirectlyFrom.push(directory);
    }

    const directoriesInsideNamespaceExport = exportedFromPath.directories.slice(directoryToImportDirectlyFrom.length);
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
        });
    }

    const moduleSpecifier = getRelativePathAsModuleSpecifierTo(
        referencedIn,
        convertExportedDirectoryPathToFilePath(directoryToImportDirectlyFrom)
    );
    addImport(moduleSpecifier, {
        namedImports: [firstDirectoryInsideNamespaceExport.exportDeclaration.namespaceExport],
    });

    const pathToFileInsideNamespaceExport: ExportedFilePath = {
        directories: directoriesInsideNamespaceExport,
        file: exportedFromPath.file,
    };

    const entityName = ts.factory.createQualifiedName(
        getEntityNameOfContainingDirectory({
            pathToFile: pathToFileInsideNamespaceExport,
        }),
        exportedName
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: pathToFileInsideNamespaceExport,
            }),
            exportedName
        ),
    };
}
