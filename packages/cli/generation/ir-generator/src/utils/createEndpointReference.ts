import { IdGenerator } from "@fern-api/ir-utils";
import { generateEndpointIdFromResolvedEndpoint } from "../resolvers/generateEndpointIdFromResolvedEndpoint";
import { isRootFernFilepath } from "./isRootFernFilepath";
import { ResolvedEndpoint } from "../resolvers/ResolvedEndpoint";
import { EndpointReference } from "@fern-api/ir-sdk";

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
