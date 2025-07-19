import { go } from "@fern-api/go-ast";

import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    allParameters: go.Parameter[];
    pathParameters: go.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: go.Parameter | undefined;
    rawReturnTypeReference: go.TypeReference;

    // All endpoints return an error by default; these fields are only set
    // if the endpoint returns a non-error value.
    pageReturnType: go.Type | undefined;
    returnType: go.Type | undefined;
    returnZeroValue: go.TypeInstantiation | undefined;
}
