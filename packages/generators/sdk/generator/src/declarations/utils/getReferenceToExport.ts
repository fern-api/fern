import { Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile, ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";
import { ModuleSpecifier } from "./ModuleSpecifier";

export declare namespace getReferenceToExport {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        exportedName: string;
        exportedFromPath: ExportedFilePath;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToExport({
    apiName,
    referencedIn,
    exportedName,
    exportedFromPath,
    addImport,
}: getReferenceToExport.Args): Reference {
    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [apiName],
    });

    return {
        entityName: ts.factory.createQualifiedName(
            getEntityNameOfContainingDirectory({
                pathToFile: exportedFromPath,
            }),
            exportedName
        ),
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: exportedFromPath,
            }),
            exportedName
        ),
    };
}
