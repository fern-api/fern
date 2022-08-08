import { ServiceName } from "@fern-fern/ir-model/services";
import { SourceFile, ts } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExportedFilepathForService } from "./getExportedFilepathForService";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";
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
    const pathToServiceFile = getExportedFilepathForService(serviceName);

    return {
        entityName: ts.factory.createQualifiedName(
            getEntityNameOfContainingDirectory({
                pathToFile: pathToServiceFile,
                apiName,
            }),
            generatedServiceName
        ),
        expression: ts.factory.createPropertyAccessExpression(
            getExpressionToContainingDirectory({
                pathToFile: pathToServiceFile,
                apiName,
            }),
            generatedServiceName
        ),
    };
}
