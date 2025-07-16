import { stringifyFernFilepath } from "@fern-api/ir-utils"

import { ResolvedEndpoint } from "./ResolvedEndpoint"

export const generateEndpointIdFromResolvedEndpoint = (resolvedEndpoint: ResolvedEndpoint): string => {
    const joinedFernFilePath = stringifyFernFilepath(resolvedEndpoint.file.fernFilepath)
    const endpointId = resolvedEndpoint.endpointId
    return `endpoint_${joinedFernFilePath}.${endpointId}`
}
