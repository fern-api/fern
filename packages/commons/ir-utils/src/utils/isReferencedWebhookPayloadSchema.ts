import { RawSchemas } from "@fern-api/fern-definition-schema"

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebhookPayloadSchema
): payload is RawSchemas.WebhookReferencedPayloadSchema {
    return (payload as RawSchemas.WebhookReferencedPayloadSchema).type != null
}
