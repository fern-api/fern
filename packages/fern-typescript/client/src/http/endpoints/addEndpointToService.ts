import { HttpEndpoint, HttpService } from "@fern-api/api";
import { DependencyManager, getTextOfTsNode, ModelContext } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { generateHttpEndpointTypes, getHttpServiceTypeReference } from "@fern-typescript/service-types";
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
    modelContext,
    encodersDirectory,
    helperManager,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    modelContext: ModelContext;
    encodersDirectory: Directory;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = generateHttpEndpointTypes({
        endpoint,
        serviceName: serviceDefinition.name,
        modelContext,
        dependencyManager,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedEndpointTypes.request != null
            ? generatedEndpointTypes.request.wrapper != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              getHttpServiceTypeReference({
                                  reference: generatedEndpointTypes.request.wrapper.reference,
                                  referencedIn: serviceFile,
                                  modelContext,
                              })
                          ),
                      },
                  ]
                : generatedEndpointTypes.request.body != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              getHttpServiceTypeReference({
                                  reference: generatedEndpointTypes.request.body,
                                  referencedIn: serviceFile,
                                  modelContext,
                              })
                          ),
                      },
                  ]
                : []
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getHttpServiceTypeReference({
                reference: generatedEndpointTypes.response.reference,
                referencedIn: serviceFile,
                modelContext,
            }),
        ])
    );

    serviceInterface.addMethod({
        name: endpoint.endpointId,
        parameters,
        returnType,
    });

    serviceClass.addMethod({
        name: endpoint.endpointId,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: await generateEndpointMethodBody({
            endpoint,
            endpointTypes: generatedEndpointTypes,
            serviceFile,
            serviceDefinition,
            helperManager,
            modelContext,
            encodersDirectory,
        }),
    });
}
