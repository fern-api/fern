import { ServiceName } from "@fern-fern/ir-model/services";
import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../types";
import { getGeneratedServiceName } from "./getGeneratedServiceName";
import { getQualifiedNameForPackageOfFilepath } from "./getQualifiedNameForPackageOfFilepath";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export declare namespace getReferenceToService {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        serviceName: ServiceName;
    }
}

export function getReferenceToService({
    referencedIn,
    apiName,
    addImport,
    serviceName,
}: getReferenceToService.Args): ts.EntityName {
    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [apiName],
    });

    const qualifiedNameOfPackage = getQualifiedNameForPackageOfFilepath({
        exportedFromPath: referencedIn.getFilePath(),
        apiName,
    });
    return ts.factory.createQualifiedName(qualifiedNameOfPackage, getGeneratedServiceName(serviceName));
}
