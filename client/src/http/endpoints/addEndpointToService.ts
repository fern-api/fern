import { HttpEndpoint, HttpService } from "@fern-api/api";
import { getTextOfTsNode, ModelContext } from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
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
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    modelContext: ModelContext;
    encodersDirectory: Directory;
    helperManager: HelperManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = modelContext.getGeneratedHttpServiceTypes({
        serviceName: serviceDefinition.name,
        endpointId: endpoint.endpointId,
    });

    const parameters: OptionalKind<ParameterDeclarationStructure>[] =
        generatedEndpointTypes.request != null
            ? generatedEndpointTypes.request.wrapper != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              modelContext.getReferenceToHttpServiceType({
                                  reference: generatedEndpointTypes.request.wrapper.reference,
                                  referencedIn: serviceFile,
                              })
                          ),
                      },
                  ]
                : generatedEndpointTypes.request.body != null
                ? [
                      {
                          name: ClientConstants.HttpService.Endpoint.Signature.REQUEST_PARAMETER,
                          type: getTextOfTsNode(
                              modelContext.getReferenceToHttpServiceType({
                                  reference: generatedEndpointTypes.request.body,
                                  referencedIn: serviceFile,
                              })
                          ),
                      },
                  ]
                : []
            : [];

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            modelContext.getReferenceToHttpServiceType({
                reference: generatedEndpointTypes.response.reference,
                referencedIn: serviceFile,
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
