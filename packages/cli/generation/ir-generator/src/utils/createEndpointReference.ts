import { EndpointReference } from "@fern-api/ir-sdk";
import { IdGenerator } from "@fern-api/ir-utils";
import { generateEndpointIdFromResolvedEndpoint } from "../resolvers/generateEndpointIdFromResolvedEndpoint";
import { ResolvedEndpoint } from "../resolvers/ResolvedEndpoint";
import { isRootFernFilepath } from "./isRootFernFilepath";

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
