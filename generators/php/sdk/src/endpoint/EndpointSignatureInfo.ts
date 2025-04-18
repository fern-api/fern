import { php } from "@fern-api/php-codegen";

import { EndpointRequest } from "./request/EndpointRequest";

export interface EndpointSignatureInfo {
    baseParameters: php.Parameter[]; // Includes both pathParameters and the requestParameter (if any).
    pathParameters: php.Parameter[];
    pathParameterReferences: Record<string, string>;
    request: EndpointRequest | undefined;
    requestParameter: php.Parameter | undefined;
    returnType: php.Type | undefined;
}
