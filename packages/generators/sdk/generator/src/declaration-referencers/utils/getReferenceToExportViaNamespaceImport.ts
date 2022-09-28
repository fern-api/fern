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
import { getEntityNameOfDirectory } from "./getEntityNameOfDirectory";
import { getExpressionToDirectory } from "./getExpressionToDirectory";

export function getReferenceToExportViaNamespaceImport({
    exportedName,
    directoryToNamespaceImport,
    filepathInsideNamespaceImport,
    namespaceImport,
    addImport,
    referencedIn,
    subImport = [],
}: {
    exportedName: string;
    directoryToNamespaceImport: ExportedDirectory[];
    filepathInsideNamespaceImport: ExportedDirectory[] | ExportedFilePath | undefined;
    namespaceImport: string;
    addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    referencedIn: SourceFile;
    subImport?: string[];
}): Reference {
    addImport(
        getRelativePathAsModuleSpecifierTo(
            referencedIn,
            convertExportedDirectoryPathToFilePath(directoryToNamespaceImport)
        ),
        { namespaceImport }
    );

    const pathToDirectoryInsideNamespaceImport =
        filepathInsideNamespaceImport != null
            ? Array.isArray(filepathInsideNamespaceImport)
                ? filepathInsideNamespaceImport
                : filepathInsideNamespaceImport.directories
            : [];

    const entityName = [exportedName, ...subImport].reduce<ts.EntityName>(
        (acc, part) => ts.factory.createQualifiedName(acc, part),
        getEntityNameOfDirectory({
            pathToDirectory: pathToDirectoryInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
        })
    );

    const expression = [exportedName, ...subImport].reduce<ts.Expression>(
        (acc, part) => ts.factory.createPropertyAccessExpression(acc, part),
        getExpressionToDirectory({
            pathToDirectory: pathToDirectoryInsideNamespaceImport,
            prefix: ts.factory.createIdentifier(namespaceImport),
        })
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression,
    };
}
