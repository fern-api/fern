import { InlinedWebhookPayloadProperty, Webhook, WebhookGroup, WebhookPayload } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { parseTypeName } from "../utils/parseTypeName";
import { convertAvailability } from "./convertDeclaration";
import { convertHttpHeader } from "./services/convertHttpService";
import { getExtensionsAsList, getPropertyName } from "./type-declarations/convertObjectTypeDeclaration";

export async function convertWebhookGroup({
    webhooks,
    file
}: {
    webhooks: Record<string, RawSchemas.WebhookSchema>;
    file: FernFileContext;
}): Promise<WebhookGroup> {
    const webhookGroup: Webhook[] = [];
    for (const [webhookId, webhook] of Object.entries(webhooks)) {
        webhookGroup.push({
            availability: convertAvailability(webhook.availability),
            displayName: webhook["display-name"],
            docs: webhook.docs,
            method: webhook.method,
            name: file.casingsGenerator.generateName(webhookId),
            headers:
                webhook.headers != null
                    ? await Promise.all(
                          Object.entries(webhook.headers).map(([headerKey, header]) =>
                              convertHttpHeader({ headerKey, header, file })
                          )
                      )
                    : [],
            payload: convertWebhookPayloadSchema({ payload: webhook.payload, file })
        });
    }
    return webhookGroup;
}

function convertWebhookPayloadSchema({
    payload,
    file
}: {
    payload: RawSchemas.WebhookPayloadSchema;
    file: FernFileContext;
}): WebhookPayload {
    if (typeof payload === "string") {
        return WebhookPayload.reference({
            docs: undefined,
            payloadType: file.parseTypeReference(payload)
        });
    } else if (isReferencedWebhookPayloadSchema(payload)) {
        return WebhookPayload.reference({
            docs: undefined,
            payloadType: file.parseTypeReference(payload.type)
        });
    } else {
        return WebhookPayload.inlinedPayload({
            name: file.casingsGenerator.generateName(payload.name),
            extends: getExtensionsAsList(payload.extends).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties:
                payload.properties != null
                    ? Object.entries(payload.properties).map(([propertyKey, propertyDefinition]) =>
                          convertInlinedRequestProperty({
                              propertyKey,
                              propertyDefinition,
                              docs: typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                              file
                          })
                      )
                    : []
        });
    }
}

function convertInlinedRequestProperty({
    propertyKey,
    propertyDefinition,
    docs,
    file
}: {
    propertyKey: string;
    propertyDefinition: RawSchemas.ObjectPropertySchema;
    docs: string | undefined;
    file: FernFileContext;
}): InlinedWebhookPayloadProperty {
    return {
        docs,
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name
        }),
        valueType: file.parseTypeReference(propertyDefinition)
    };
}

export function isReferencedWebhookPayloadSchema(
    payload: RawSchemas.WebhookPayloadSchema
): payload is RawSchemas.WebhookReferencedPayloadSchema {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (payload as RawSchemas.WebhookReferencedPayloadSchema).type != null
    );
}
