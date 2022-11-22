import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services/http";
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
    dependencyManager,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    serviceDefinition: HttpService;
    modelContext: ModelContext;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const serviceFile = serviceInterface.getSourceFile();

    const generatedEndpointTypes = modelContext.getGeneratedHttpServiceTypes({
        serviceName: serviceDefinition.name,
        endpointId: endpoint.name.camelCase,
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
        name: endpoint.name.camelCase,
        parameters,
        returnType,
    });

    serviceClass.addMethod({
        name: endpoint.name.camelCase,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: await generateEndpointMethodBody({
            endpoint,
            endpointTypes: generatedEndpointTypes,
            serviceFile,
            serviceDefinition,
            modelContext,
            dependencyManager,
        }),
    });
}
