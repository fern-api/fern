import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../types";
import { getEntityNameOfPackage } from "./getEntityNameOfPackage";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export declare namespace getReferenceToExportedType {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        typeName: string;
        exportedFromPath: string;
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
    const qualifiedNameOfPackage = getEntityNameOfPackage({
        pathToFileInPackage: exportedFromPath,
        apiName,
    });
    return ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(qualifiedNameOfPackage, typeName));
}
