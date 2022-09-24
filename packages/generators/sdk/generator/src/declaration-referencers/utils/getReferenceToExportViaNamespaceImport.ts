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
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";

export function getReferenceToExportViaNamespaceImport({
    exportedName,
    directoryToNamespaceImport,
    filepathInsideNamespaceImport,
    namespaceImport,
    addImport,
    referencedIn,
}: {
    exportedName: string;
    directoryToNamespaceImport: ExportedDirectory[];
    filepathInsideNamespaceImport: ExportedFilePath;
    namespaceImport: string;
    addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    referencedIn: SourceFile;
}): Reference {
    addImport(
        getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToNamespaceImport)
        ),
        { namespaceImport }
    );

    const entityName = ts.factory.createQualifiedName(
        getEntityNameOfContainingDirectory({
            pathToFile: filepathInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
        }),
        exportedName
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: filepathInsideNamespaceImport,
                prefix: ts.factory.createIdentifier(namespaceImport),
            }),
            exportedName
        ),
    };
}
