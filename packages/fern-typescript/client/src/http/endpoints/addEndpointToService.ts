import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { DependencyManager, getTextOfTsNode } from "@fern-typescript/commons";
import { ModelContext } from "@fern-typescript/model-context";
import { getHttpRequestParameters } from "@fern-typescript/service-types";
import { ClassDeclaration, InterfaceDeclaration, Scope, ts } from "ts-morph";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";

export async function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    serviceDefinition,
    modelContext,
    helperManager,
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    modelContext: ModelContext;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = modelContext.getGeneratedHttpServiceTypes({
        serviceName: serviceDefinition.name,
        endpointId: endpoint.endpointId,
    });

    const parameters = getHttpRequestParameters({ generatedEndpointTypes, modelContext, file: serviceFile });

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
            dependencyManager,
        }),
    });
}
