import { ServiceName } from "@fern-fern/ir-model/services";
import { SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfPackage } from "./getEntityNameOfPackage";
import { getExpressionOfPackage } from "./getExpressionOfPackage";
import { getFilepathForService } from "./getFilepathForService";
import { getGeneratedServiceName } from "./getGeneratedServiceName";

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

    const generatedServiceName = getGeneratedServiceName(serviceName);
    const pathToServiceFile = getFilepathForService(serviceName);

    return {
        entityName: ts.factory.createQualifiedName(
            getEntityNameOfPackage({
                pathToFileInPackage: pathToServiceFile,
                apiName,
            }),
            generatedServiceName
        ),
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionOfPackage({
                pathToFileInPackage: pathToServiceFile,
                apiName,
            }),
            generatedServiceName
        ),
    };
}
