import { HttpEndpoint, NamedType } from "@fern-api/api";
import { DependencyManager, getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateRequestTypes } from "./generateRequestTypes";
import { generateResponseTypes } from "./generateResponseTypes";
import { GeneratedEndpointTypes } from "./types";

export function generateEndpointTypes({
    serviceName,
    endpoint,
    endpointsDirectory,
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    typeResolver,
    dependencyManager,
}: {
    serviceName: NamedType;
    endpoint: HttpEndpoint;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
    dependencyManager: DependencyManager;
}): GeneratedEndpointTypes {
    const endpointDirectory = getOrCreateDirectory(endpointsDirectory, endpoint.endpointId, {
        exportOptions: {
            type: "namespace",
            namespace: endpoint.endpointId,
        },
    });

    return {
        methodName: endpoint.endpointId,
        request: generateRequestTypes({
            serviceName,
            endpoint,
            endpointDirectory,
            modelDirectory,
            servicesDirectory,
            typeResolver,
        }),
        response: generateResponseTypes({
            serviceName,
            endpoint,
            endpointDirectory,
            modelDirectory,
            errorsDirectory,
            servicesDirectory,
            typeResolver,
            dependencyManager,
        }),
    };
}
