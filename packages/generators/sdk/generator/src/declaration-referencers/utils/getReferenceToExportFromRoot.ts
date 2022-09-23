import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../utils/ModuleSpecifier";
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
    const firstPartOfPath = exportedFromPath.directories[0];
    if (firstPartOfPath == null) {
        throw new Error("Cannot add import to reference because path is empty: " + exportedFromPath.file.nameOnDisk);
    }
    if (firstPartOfPath.exportDeclaration?.namespaceExport == null) {
        throw new Error(
            "Cannot add import to reference because path is not namespace-exported: " + exportedFromPath.file.nameOnDisk
        );
    }

    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [firstPartOfPath.exportDeclaration.namespaceExport],
    });

    const entityName = ts.factory.createQualifiedName(
        getEntityNameOfContainingDirectory({
            pathToFile: exportedFromPath,
        }),
        exportedName
    );

    return {
        typeNode: ts.factory.createTypeReferenceNode(entityName),
        entityName,
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: exportedFromPath,
            }),
            exportedName
        ),
    };
}
