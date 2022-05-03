import { HttpEndpoint } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { ENDPOINTS_DIRECTORY_NAME } from "../../constants";
import { generateRequestTypes } from "./request/generateRequestTypes";
import { generateResponseTypes } from "./response/generateResponseTypes";
import { GeneratedEndpointTypes } from "./types";

export function generateEndpointTypes({
    endpoint,
    endpointsDirectory,
    serviceDirectory,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceDirectory: Directory;
    endpointsDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
}): GeneratedEndpointTypes {
    getOrCreateDirectory(endpointsDirectory, endpoint.endpointId, {
        exportOptions: {
            type: "namespace",
            namespace: endpoint.endpointId,
        },
    });

    const endpointDirectory = serviceDirectory
        .getDirectoryOrThrow(ENDPOINTS_DIRECTORY_NAME)
        .getDirectoryOrThrow(endpoint.endpointId);

    return {
        methodName: endpoint.endpointId,
        ...generateRequestTypes({ endpoint, endpointDirectory, modelDirectory, typeResolver }),
        ...generateResponseTypes({ endpoint, endpointDirectory, modelDirectory, errorsDirectory, typeResolver }),
    };
}
