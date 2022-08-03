import { ServiceName } from "@fern-fern/ir-model/services";
import { SourceFile, ts } from "ts-morph";
import { ImportDeclaration } from "../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../types";
import { getEntityNameOfPackage } from "./getEntityNameOfPackage";
import { getExpressionOfPackage } from "./getExpressionOfPackage";
import { getGeneratedServiceName } from "./getGeneratedServiceName";
import { getRelativePathAsModuleSpecifierTo } from "./getRelativePathAsModuleSpecifierTo";

export interface ServiceReference {
    entityName: ts.EntityName;
    expression: ts.Expression;
}

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
}: getReferenceToService.Args): ServiceReference {
    const moduleSpecifierOfRoot = getRelativePathAsModuleSpecifierTo(referencedIn, "/");
    addImport(moduleSpecifierOfRoot, {
        namedImports: [apiName],
    });

    const qualifiedNameOfPackage = getEntityNameOfPackage({
        pathToFileInPackage: referencedIn.getFilePath(),
        apiName,
    });

    return {
        entityName: ts.factory.createQualifiedName(qualifiedNameOfPackage, getGeneratedServiceName(serviceName)),
        expression: getExpressionOfPackage({ pathToFileInPackage: referencedIn.getFilePath(), apiName }),
    };
}
