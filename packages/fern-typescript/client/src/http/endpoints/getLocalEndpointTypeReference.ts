import { NamedType } from "@fern-api/api";
import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import { Directory, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../../constants";

const SERVICES_NAMESPACE_IMPORT = "Services";

export type EndpointTypeName =
    | typeof ClientConstants.HttpService.Endpoint.Types.Request.TYPE_NAME
    | typeof ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.TYPE_NAME
    | typeof ClientConstants.HttpService.Endpoint.Types.Response.TYPE_NAME
    | typeof ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME
    | typeof ClientConstants.HttpService.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME;

export declare namespace getLocalEndpointTypeReference {
    export interface Args {
        serviceName: NamedType;
        endpointId: string;
        typeName: EndpointTypeName;
        referencedIn: SourceFile;
        servicesDirectory: Directory;
    }
}

export function getLocalEndpointTypeReference({
    serviceName: { name: serviceName },
    endpointId,
    typeName,
    referencedIn,
    servicesDirectory,
}: getLocalEndpointTypeReference.Args): ts.TypeReferenceNode {
    const serviceDirectory = servicesDirectory.getDirectoryOrThrow(serviceName);

    // if inside the services directory, import { PostService }
    if (servicesDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, serviceDirectory),
            namespaceImport: serviceName,
        });
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(serviceName),
                    ts.factory.createIdentifier(endpointId)
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
                    ts.factory.createIdentifier(serviceName)
                ),
                ts.factory.createIdentifier(endpointId)
            ),
            ts.factory.createIdentifier(typeName)
        )
    );
}
