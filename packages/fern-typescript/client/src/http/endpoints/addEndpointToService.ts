import { HttpEndpoint, HttpService } from "@fern-api/api";
import { DependencyManager, getTextOfTsNode, getTypeReference, TypeResolver } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { getLocalServiceTypeReference, ServiceTypeName } from "@fern-typescript/service-types";
import {
    ClassDeclaration,
    Directory,
    InterfaceDeclaration,
    OptionalKind,
    ParameterDeclarationStructure,
    Scope,
    ts,
} from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";

export async function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    serviceDefinition,
    modelDirectory,
    endpointsDirectory,
    servicesDirectory,
    encodersDirectory,
    typeResolver,
    helperManager,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    servicesDirectory: Directory;
    encodersDirectory: Directory;
    typeResolver: TypeResolver;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const getReferenceToLocalServiceType = (typeName: ServiceTypeName): ts.TypeReferenceNode => {
        return getLocalServiceTypeReference({
            serviceOrChannelName: serviceDefinition.name,
            typeName,
            endpointOrOperationId: endpoint.endpointId,
            servicesDirectory,
            referencedIn: serviceFile,
        });
    };

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        endpoint.request.type._type !== "model" || endpoint.request.type.model._type !== "void"
            ? [
                  {
                      name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          generatedEndpointTypes.request.wrapper.reference.isLocal
                              ? getReferenceToLocalServiceType(
                                    generatedEndpointTypes.request.wrapper.reference.typeName
                                )
                              : getTypeReference({
                                    reference: generatedEndpointTypes.request.wrapper.reference.typeReference,
                                    referencedIn: serviceFile,
                                    modelDirectory,
                                })
                      ),
                  },
              ]
            : generatedEndpointTypes.request.body != null
            ? [
                  {
                      name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                      type: getTextOfTsNode(
                          generatedEndpointTypes.request.body.isLocal
                              ? getReferenceToLocalServiceType(generatedEndpointTypes.request.body.typeName)
                              : getTypeReference({
                                    reference: generatedEndpointTypes.request.body.typeReference,
                                    referencedIn: serviceFile,
                                    modelDirectory,
                                })
                      ),
                  },
              ]
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getReferenceToLocalServiceType(generatedEndpointTypes.response.reference.typeName),
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
            getReferenceToLocalServiceType,
            typeResolver,
            helperManager,
            modelDirectory,
            encodersDirectory,
        }),
    });
}
