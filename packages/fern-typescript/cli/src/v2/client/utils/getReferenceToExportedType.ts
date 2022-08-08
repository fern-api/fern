import { SourceFile, ts } from "ts-morph";
import { ExportedFilePath } from "../../exports-manager/ExportedFilePath";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";

export declare namespace getReferenceToExportedType {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        typeName: string;
        exportedFromPath: ExportedFilePath;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
    }
}

export function getReferenceToExportedType({
    apiName,
    referencedIn,
    typeName,
    exportedFromPath,
    addImport,
}: getReferenceToExportedType.Args): ts.TypeNode {
    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [apiName],
    });
    const qualifiedNameOfPackage = getEntityNameOfContainingDirectory({
        pathToFile: exportedFromPath,
        apiName,
    });
    return ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(qualifiedNameOfPackage, typeName));
}
