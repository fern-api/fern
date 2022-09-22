import { Reference } from "@fern-typescript/declaration-handler";
import { SourceFile, ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";

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
