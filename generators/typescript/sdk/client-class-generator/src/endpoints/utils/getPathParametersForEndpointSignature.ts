import { HttpEndpoint, HttpService, PathParameter } from "@fern-fern/ir-sdk/api";
import { getNonVariablePathParameters } from "./getNonVariablePathParameters";

export function getPathParametersForEndpointSignature(service: HttpService, endpoint: HttpEndpoint): PathParameter[] {
    return getNonVariablePathParameters([...service.pathParameters, ...endpoint.pathParameters]);
}
