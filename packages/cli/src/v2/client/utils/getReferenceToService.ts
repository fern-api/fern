import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ServiceReference } from "@fern-typescript/declaration-handler";
import { SourceFile } from "ts-morph";
import { getRelativePathAsModuleSpecifierTo } from "../../getRelativePathAsModuleSpecifierTo";
import { ImportDeclaration } from "../../imports-manager/ImportsManager";
import { ModuleSpecifier } from "../../types";
import { getEntityNameOfContainingDirectory } from "./getEntityNameOfContainingDirectory";
import { getExportedFilepathForService } from "./getExportedFilepathForService";
import { getExpressionToContainingDirectory } from "./getExpressionToContainingDirectory";

export declare namespace getReferenceToService {
    export interface Args {
        apiName: string;
        referencedIn: SourceFile;
        addImport: (moduleSpecifier: ModuleSpecifier, importDeclaration: ImportDeclaration) => void;
        serviceName: DeclaredServiceName;
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

    const pathToServiceFile = getExportedFilepathForService(serviceName, apiName);

    return {
        entityName: getEntityNameOfContainingDirectory({
            pathToFile: pathToServiceFile,
        }),
        expression: getExpressionToContainingDirectory({
            pathToFile: pathToServiceFile,
        }),
    };
}
