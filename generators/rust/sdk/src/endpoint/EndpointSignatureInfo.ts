import { rust } from "@fern-api/rust-codegen";

import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    baseParameters: rust.Parameter[]; // Includes both pathParameters and the requestParameter (if any).
    pathParameters: rust.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: rust.Parameter | undefined;
    returnType: rust.Type | undefined;
}
