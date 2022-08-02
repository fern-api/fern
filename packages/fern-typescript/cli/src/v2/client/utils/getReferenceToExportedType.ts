import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ImportOptions, ModuleSpecifier } from "../types";
import { getQualifiedNameForPackageOfFilepath } from "./getQualifiedNameForPackageOfFilepath";
import { getRelativeModuleSpecifierTo } from "./getRelativeModuleSpecifierTo";

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

        const qualifiedNameOfPackage = getQualifiedNameForPackageOfFilepath({ exportedFromPath, apiName });
        return ts.factory.createTypeReferenceNode(ts.factory.createQualifiedName(qualifiedNameOfPackage, typeName));
    }
}
