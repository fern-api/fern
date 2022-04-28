import { HttpEndpoint } from "@fern-api/api";
import { TypeResolver, withDirectory } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { ENDPOINTS_DIRECTORY_NAME } from "../../constants";
import { generateRequestTypes } from "./request/generateRequestTypes";
import { generateResponseTypes } from "./response/generateResponseTypes";
import { GeneratedEndpointTypes } from "./types";

const noop = () => {
    /* no-op */
};

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
    withDirectory(
        {
            containingModule: endpointsDirectory,
            name: endpoint.endpointId,
            namespaceExport: endpoint.endpointId,
        },
        noop
    );

    const endpointDirectory = serviceDirectory
        .getDirectoryOrThrow(ENDPOINTS_DIRECTORY_NAME)
        .getDirectoryOrThrow(endpoint.endpointId);

    return {
        methodName: endpoint.endpointId,
        ...generateRequestTypes({ endpoint, endpointDirectory, modelDirectory, typeResolver }),
        ...generateResponseTypes({ endpoint, endpointDirectory, modelDirectory, errorsDirectory, typeResolver }),
    };
}
