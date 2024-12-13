import { HttpEndpoint, HttpService, PathParameter } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { getNonVariablePathParameters } from "./getNonVariablePathParameters";

export function getPathParametersForEndpointSignature({
    service,
    endpoint,
    context
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    context: SdkContext;
}): PathParameter[] {
    const shouldInlinePathParameters = context.requestWrapper.shouldInlinePathParameters(endpoint.sdkRequest);
    const pathParams = shouldInlinePathParameters ? [] : endpoint.pathParameters;
    return getNonVariablePathParameters([...service.pathParameters, ...pathParams]);
}
