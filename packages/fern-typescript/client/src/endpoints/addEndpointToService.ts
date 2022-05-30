import { HttpEndpoint, HttpService } from "@fern-api/api";
import { generateTypeReference, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ClassDeclaration, Directory, InterfaceDeclaration, Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";
import { generateEndpointTypes } from "./generate-endpoint-types/generateEndpointTypes";

export async function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    serviceDefinition,
    modelDirectory,
    errorsDirectory,
    endpointsDirectory,
    typeResolver,
    helperManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();
    const serviceDirectory = serviceFile.getDirectory();

    const generatedEndpointTypes = generateEndpointTypes({
        endpoint,
        serviceDirectory,
        endpointsDirectory,
        modelDirectory,
        errorsDirectory,
        typeResolver,
    });

    const getReferenceToEndpointType = (reference: ts.Identifier): ts.TypeReferenceNode => {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier(ClientConstants.Service.NamespaceImports.ENDPOINTS),
                    ts.factory.createIdentifier(endpoint.endpointId)
                ),
                reference
            )
        );
    };

    const parameters =
        generatedEndpointTypes.endpointParameter != null
            ? [
                  {
                      name: ClientConstants.Service.Endpoint.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          generatedEndpointTypes.endpointParameter.isLocal
                              ? getReferenceToEndpointType(generatedEndpointTypes.endpointParameter.typeName)
                              : generateTypeReference({
                                    reference: generatedEndpointTypes.endpointParameter.typeReference,
                                    referencedIn: serviceFile,
                                    modelDirectory,
                                    factory: ts.factory,
                                    SyntaxKind: ts.SyntaxKind,
                                })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToEndpointType(
                ts.factory.createIdentifier(ClientConstants.Service.Endpoint.Types.Response.TYPE_NAME)
            ),
        ])
    );

    serviceInterface.addMethod({
        name: generatedEndpointTypes.methodName,
        parameters,
        returnType,
    });

    serviceClass.addMethod({
        name: generatedEndpointTypes.methodName,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: await generateEndpointMethodBody({
            endpoint,
            endpointTypes: generatedEndpointTypes,
            serviceFile,
            serviceDefinition,
            getReferenceToEndpointType,
            typeResolver,
            helperManager,
            modelDirectory,
        }),
    });
}
