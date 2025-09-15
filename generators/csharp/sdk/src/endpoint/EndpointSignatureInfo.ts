import { ast } from "@fern-api/csharp-codegen";

import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    baseParameters: ast.Parameter[]; // Includes both pathParameters and the requestParameter (if any).
    pathParameters: ast.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: ast.Parameter | undefined;
    returnType: ast.Type | undefined;
}
