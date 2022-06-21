import { TypeName } from "@fern-api/api";
import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ServiceTypeName } from "../types";

const SERVICES_NAMESPACE_IMPORT = "Services";

export declare namespace getLocalServiceTypeReference {
    export interface Args {
        serviceOrChannelName: TypeName;
        endpointOrOperationId: string;
        typeName: ServiceTypeName;
        referencedIn: SourceFile;
        servicesDirectory: Directory;
    }
}

export function getLocalServiceTypeReference({
    serviceOrChannelName: { name: serviceOrChannelName },
    endpointOrOperationId,
    typeName,
    referencedIn,
    servicesDirectory,
}: getLocalServiceTypeReference.Args): ts.TypeReferenceNode {
    // if inside the services directory, import the service from the root of the services directory to mimic how a
    // consumer would import the type
    if (servicesDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, servicesDirectory),
            namedImports: [serviceOrChannelName],
        });
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(serviceOrChannelName),
                    ts.factory.createIdentifier(endpointOrOperationId)
                ),
                ts.factory.createIdentifier(typeName)
            )
        );
    }

    // if outside the services directory: import * as Services
    referencedIn.addImportDeclaration({
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, servicesDirectory),
        namespaceImport: SERVICES_NAMESPACE_IMPORT,
    });
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(SERVICES_NAMESPACE_IMPORT),
                    ts.factory.createIdentifier(serviceOrChannelName)
                ),
                ts.factory.createIdentifier(endpointOrOperationId)
            ),
            ts.factory.createIdentifier(typeName)
        )
    );
}
