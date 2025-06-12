import { go } from "@fern-api/go-ast";
import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    baseParameters: go.Parameter[]; // Includes both pathParameters and the requestParameter (if any).
    pathParameters: go.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: go.Parameter | undefined;
    returnType: go.Type | undefined;
}
