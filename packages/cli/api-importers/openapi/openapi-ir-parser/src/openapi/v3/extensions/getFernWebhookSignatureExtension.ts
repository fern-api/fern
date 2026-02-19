import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

export interface WebhookSignatureExtensionSchema {
    header: string;
    algorithm?: "sha256" | "sha1" | "sha384" | "sha512";
    encoding?: "base64" | "hex";
    "payload-format"?: "body-only" | "url-prefixed";
}

export function getFernWebhookSignatureExtension(
    document: OpenAPIV3.Document,
    operation: OpenAPIV3.OperationObject
): WebhookSignatureExtensionSchema | undefined {
    const perOperation = getExtension<WebhookSignatureExtensionSchema>(
        operation,
        FernOpenAPIExtension.WEBHOOK_SIGNATURE
    );
    if (perOperation != null) {
        const global = getExtension<WebhookSignatureExtensionSchema>(document, FernOpenAPIExtension.WEBHOOK_SIGNATURE);
        if (global != null) {
            return { ...global, ...perOperation };
        }
        return perOperation;
    }
    return getExtension<WebhookSignatureExtensionSchema>(document, FernOpenAPIExtension.WEBHOOK_SIGNATURE);
}
