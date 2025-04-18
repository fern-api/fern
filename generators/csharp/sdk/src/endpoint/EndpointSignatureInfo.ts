import { csharp } from "@fern-api/csharp-codegen";

import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    baseParameters: csharp.Parameter[]; // Includes both pathParameters and the requestParameter (if any).
    pathParameters: csharp.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: csharp.Parameter | undefined;
    returnType: csharp.Type | undefined;
}
