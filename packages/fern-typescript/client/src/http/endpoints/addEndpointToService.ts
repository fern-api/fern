import { HttpEndpoint, HttpService } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    getTextOfTsNode,
    ModelContext,
    TypeResolver,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { generateHttpEndpointTypes, getServiceTypeReference } from "@fern-typescript/service-types";
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
    modelContext,
    encodersDirectory,
    typeResolver,
    errorResolver,
    helperManager,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    modelDirectory: Directory;
    modelContext: ModelContext;
    encodersDirectory: Directory;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = generateHttpEndpointTypes({
        endpoint,
        serviceName: serviceDefinition.name,
        modelDirectory,
        modelContext,
        typeResolver,
        errorResolver,
        dependencyManager,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedEndpointTypes.request != null
            ? generatedEndpointTypes.request.wrapper != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              getServiceTypeReference({
                                  reference: generatedEndpointTypes.request.wrapper.reference,
                                  referencedIn: serviceFile,
                                  modelDirectory,
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
                              getServiceTypeReference({
                                  reference: generatedEndpointTypes.request.body,
                                  referencedIn: serviceFile,
                                  modelDirectory,
                                  modelContext,
                              })
                          ),
                      },
                  ]
                : []
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            getServiceTypeReference({
                reference: generatedEndpointTypes.response.reference,
                referencedIn: serviceFile,
                modelDirectory,
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
            typeResolver,
            helperManager,
            modelDirectory,
            modelContext,
            encodersDirectory,
        }),
    });
}
