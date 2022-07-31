import path from "path";
import { SourceFile, ts } from "ts-morph";
import { ImportOptions, ModuleSpecifier } from "../types";
import { getRelativeModuleSpecifierTo } from "./getRelativeModuleSpecifierTo";
import { ImportDeclaration } from "./Imports";

export declare namespace getReferenceToExportedType {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        typeName: string;
        exportedFromPath: string;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        importOptions: ImportOptions;
    }
}

export function getReferenceToExportedType({
    apiName,
    referencedIn,
    typeName,
    exportedFromPath,
    addImport,
    importOptions,
}: getReferenceToExportedType.Args): ts.TypeNode {
    if (importOptions.importDirectlyFromFile) {
        const moduleSpecifierOfOtherType = getRelativeModuleSpecifierTo(referencedIn, exportedFromPath);
        addImport(moduleSpecifierOfOtherType, {
            namedImports: [typeName],
        });
        return ts.factory.createTypeReferenceNode(typeName);
    } else {
        const moduleSpecifierOfRoot = getRelativeModuleSpecifierTo(referencedIn, "/");
        addImport(moduleSpecifierOfRoot, {
            namedImports: [apiName],
        });
        const qualifiedNameToPackage = path
            .dirname(exportedFromPath)
            .split(path.sep)
            .filter((part) => part.length > 0)
            .reduce<ts.EntityName>((qualifiedReference, fernFilepathItem) => {
                return ts.factory.createQualifiedName(qualifiedReference, fernFilepathItem);
            }, ts.factory.createIdentifier(apiName));
        return ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(qualifiedNameToPackage, typeName));
    }
}
