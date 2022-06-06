import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateRequestTypes } from "./request/generateRequestTypes";
import { generateResponseTypes } from "./response/generateResponseTypes";
import { GeneratedEndpointTypes } from "./types";

export function generateEndpointTypes({
    serviceName,
    endpoint,
    endpointsDirectory,
    serviceDirectory,
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    serviceName: NamedType;
    endpoint: HttpEndpoint;
    serviceDirectory: Directory;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    servicesDirectory: Directory;
    typeResolver: TypeResolver;
}): GeneratedEndpointTypes {
    getOrCreateDirectory(endpointsDirectory, endpoint.endpointId, {
        exportOptions: {
            type: "namespace",
            namespace: endpoint.endpointId,
        },
    });

    const endpointDirectory = serviceDirectory
        .getDirectoryOrThrow(ClientConstants.Files.ENDPOINTS_DIRECTORY_NAME)
        .getDirectoryOrThrow(endpoint.endpointId);

    return {
        methodName: endpoint.endpointId,
        ...generateRequestTypes({
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
        }),
    };
}
