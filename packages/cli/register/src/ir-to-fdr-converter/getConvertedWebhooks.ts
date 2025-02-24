import { MediaType } from "@fern-api/core-utils";
import { FernIr as Ir } from "@fern-api/ir-sdk";
import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";
import { convertTypeReference } from "./getConvertedTypes";

export function getConvertedWebhooks(
    ir: Ir.ir.IntermediateRepresentation
): Record<FdrCjsSdk.WebhookId, FdrCjsSdk.api.latest.WebhookDefinition> {
    const webhooks: Record<FdrCjsSdk.WebhookId, FdrCjsSdk.api.latest.WebhookDefinition> = {};

    for (const webhookGroup of Object.values(ir.webhookGroups)) {
        for (const webhook of webhookGroup) {
            const convertedWebhook = convertWebhook(webhook);
            webhooks[convertedWebhook.id] = convertedWebhook;
        }
    }

    return webhooks;
}

function convertWebhook(webhook: Ir.webhooks.Webhook): FdrCjsSdk.api.latest.WebhookDefinition {
    return {
        id: FdrCjsSdk.WebhookId(webhook.name.originalName),
        displayName: webhook.displayName ?? webhook.name.originalName,
        description: webhook.docs ?? undefined,
        method: webhook.method,
        headers: webhook.headers.map(
            (header): FdrCjsSdk.api.latest.ObjectProperty => ({
                description: header.docs ?? undefined,
                key: FdrCjsSdk.PropertyKey(header.name.wireValue),
                valueShape: convertTypeReference(header.valueType),
                availability: undefined
            })
        ),
        requests: webhook.payload != null ? [{
            contentType: MediaType.APPLICATION_JSON,
            body: {
                type: "alias",
                value: convertTypeReference(webhook.payload)
            }
        }] : undefined,
        examples: webhook.examples?.map((example) => ({
            name: undefined,
            requestBody: {
                type: "json",
                value: example.payload.jsonExample
            }
        })) ?? []
    };
}
