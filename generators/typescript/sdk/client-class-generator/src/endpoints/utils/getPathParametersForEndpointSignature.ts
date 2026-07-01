import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";

import { getNonVariablePathParameters } from "./getNonVariablePathParameters.js";

export function getPathParametersForEndpointSignature({
    endpoint,
    context
}: {
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    context: FileContext;
}): FernIr.PathParameter[] {
    const shouldInlinePathParameters = context.requestWrapper.shouldInlinePathParameters(endpoint.sdkRequest);
    return shouldInlinePathParameters
        ? []
        : getNonVariablePathParameters(
              endpoint.allPathParameters.filter((p) => p.location !== FernIr.PathParameterLocation.Root)
          );
}
