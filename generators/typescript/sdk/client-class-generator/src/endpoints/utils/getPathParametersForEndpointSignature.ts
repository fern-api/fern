import { FernIr } from "@fern-fern/ir-sdk";
import { SdkContext } from "@fern-typescript/contexts";

import { getNonVariablePathParameters } from "./getNonVariablePathParameters.js";

export function getPathParametersForEndpointSignature({
    service,
    endpoint,
    context
}: {
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    context: SdkContext;
}): FernIr.PathParameter[] {
    const shouldInlinePathParameters = context.requestWrapper.shouldInlinePathParameters(endpoint.sdkRequest);
    return shouldInlinePathParameters
        ? []
        : getNonVariablePathParameters([...service.pathParameters, ...endpoint.pathParameters]);
}
