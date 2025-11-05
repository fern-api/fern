import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../getExtension";

// The standard webhooks syntax introduced in OpenAPI v3.1.0.
// It can be parsed just like paths.
//
// https://github.com/OAI/OpenAPI-Specification/blob/c3ac262c8e4b41bdc9da187dd6c7846981951ab6/examples/v3.1/webhook-example.yaml#L6
const WEBHOOKS = "webhooks";

export function getWebhooksPathsObject(document: OpenAPIV3.Document): OpenAPIV3.PathsObject {
    return getExtension<OpenAPIV3.PathsObject>(document, WEBHOOKS) ?? {};
}
