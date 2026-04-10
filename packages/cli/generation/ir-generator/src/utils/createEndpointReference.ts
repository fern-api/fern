import { EndpointReference } from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";
import { generateEndpointIdFromResolvedEndpoint } from "../resolvers/generateEndpointIdFromResolvedEndpoint.js";
import { ResolvedEndpoint } from "../resolvers/ResolvedEndpoint.js";
import { isRootFernFilepath } from "./isRootFernFilepath.js";

export function createEndpointReference({
    resolvedEndpoint
}: {
    resolvedEndpoint: ResolvedEndpoint;
}): EndpointReference {
    return {
        endpointId: generateEndpointIdFromResolvedEndpoint(resolvedEndpoint),
        serviceId: IdGenerator.generateServiceIdFromFernFilepath(resolvedEndpoint.file.fernFilepath),
        subpackageId: !isRootFernFilepath({ fernFilePath: resolvedEndpoint.file.fernFilepath })
            ? IdGenerator.generateSubpackageId(resolvedEndpoint.file.fernFilepath)
            : undefined
    };
}
