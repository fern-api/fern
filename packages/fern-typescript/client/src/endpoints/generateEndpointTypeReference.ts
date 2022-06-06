import { NamedType } from "@fern-api/api";
import { getRelativePathAsModuleSpecifierTo } from "@fern-typescript/commons";
import path from "path";
import { Directory, SourceFile, ts } from "ts-morph";
import { ClientConstants } from "../constants";

const SERVICES_NAMESPACE_IMPORT = "Services";

export type EndpointTypeName =
    | typeof ClientConstants.Service.Endpoint.Types.Request.TYPE_NAME
    | typeof ClientConstants.Service.Endpoint.Types.Request.Properties.Body.TYPE_NAME
    | typeof ClientConstants.Service.Endpoint.Types.Response.TYPE_NAME
    | typeof ClientConstants.Service.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME
    | typeof ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME;

export declare namespace generateEndpointTypeReference {
    export interface Args {
        serviceName: NamedType;
        endpointId: string;
        typeName: EndpointTypeName;
        referencedIn: SourceFile;
        servicesDirectory: Directory;
    }
}

export function generateEndpointTypeReference({
    serviceName: { name: serviceName },
    endpointId,
    typeName,
    referencedIn,
    servicesDirectory,
}: generateEndpointTypeReference.Args): ts.TypeReferenceNode {
    const serviceDirectory = servicesDirectory.getDirectoryOrThrow(serviceName);
    const endpointDirectory = serviceDirectory.getDirectoryOrThrow(
        path.join(ClientConstants.Files.ENDPOINTS_DIRECTORY_NAME, endpointId)
    );
    const typeFile = endpointDirectory.getSourceFileOrThrow(`${typeName}.ts`);

    // if inside the endpoint directory, just use a relative import
    if (endpointDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, typeFile),
            namedImports: [typeName],
        });
        return ts.factory.createTypeReferenceNode(typeName);
    }

    // if inside the service directory, import * as endpoints
    if (serviceDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, endpointDirectory),
            namespaceImport: ClientConstants.Files.ENDPOINTS_DIRECTORY_NAME,
        });
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(ClientConstants.Files.ENDPOINTS_DIRECTORY_NAME),
                    ts.factory.createIdentifier(endpointId)
                ),
                ts.factory.createIdentifier(typeName)
            )
        );
    }

    // if inside the services directory, import { PostService }
    if (servicesDirectory.isAncestorOf(referencedIn)) {
        referencedIn.addImportDeclaration({
            moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, serviceDirectory),
            namespaceImport: serviceName,
        });
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(serviceName),
                        ts.factory.createIdentifier(ClientConstants.Files.ENDPOINTS_NAMESPACE_EXPORT)
                    ),
                    ts.factory.createIdentifier(endpointId)
                ),
                ts.factory.createIdentifier(typeName)
            )
        );
    }

    // outside the services directory: import * as Services
    referencedIn.addImportDeclaration({
        moduleSpecifier: getRelativePathAsModuleSpecifierTo(referencedIn, servicesDirectory),
        namespaceImport: SERVICES_NAMESPACE_IMPORT,
    });
    return ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(SERVICES_NAMESPACE_IMPORT),
                        ts.factory.createIdentifier(serviceName)
                    ),
                    ts.factory.createIdentifier(ClientConstants.Files.ENDPOINTS_NAMESPACE_EXPORT)
                ),
                ts.factory.createIdentifier(endpointId)
            ),
            ts.factory.createIdentifier(typeName)
        ),
        undefined
    );
}
