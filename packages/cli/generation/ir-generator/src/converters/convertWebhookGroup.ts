import { RawSchemas } from "@fern-api/yaml-schema";
import { Webhook, WebhookGroup, WebhookPayload } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../FernFileContext";
import { convertAvailability } from "./convertDeclaration";
import { constructHttpPath } from "./services/constructHttpPath";
import { convertHttpHeader } from "./services/convertHttpService";

export function convertWebhookGroup({
    webhooks,
    file,
}: {
    webhooks: Record<string, RawSchemas.WebhookSchema>;
    file: FernFileContext;
}): WebhookGroup {
    const webhookGroup: Webhook[] = [];
    for (const [webhookId, webhook] of Object.entries(webhooks)) {
        webhookGroup.push({
            availability: convertAvailability(webhook.availability),
            displayName: webhook["display-name"],
            docs: webhook.docs,
            method: webhook.method,
            path: constructHttpPath(webhook.path),
            name: file.casingsGenerator.generateName(webhookId),
            headers:
                typeof webhook.payload !== "string" && webhook.payload?.headers != null
                    ? Object.entries(webhook.payload.headers).map(([headerKey, header]) =>
                          convertHttpHeader({ headerKey, header, file })
                      )
                    : [],
            payload:
                webhook.payload != null
                    ? typeof webhook.payload === "string"
                        ? WebhookPayload.reference({
                              docs: undefined,
                              payloadType: file.parseTypeReference(webhook.payload),
                          })
                        : undefined
                    : undefined,
        });
    }
    return webhookGroup;
}

function convertWebhookPayloadSchema({
    webhookPayload,
    file,
}: {
    webhookPayload: RawSchemas.WebhookPayloadSchema;
    file: FernFileContext;
}): WebhookPayload {
    return WebhookPayload.inlinedPayload({
        name: file.casingsGenerator.generateName(webhookPayload.name),
        extends: getExtensionsAsList(request.body.extends).map((extended) =>
            parseTypeName({ typeName: extended, file })
        ),
        contentType: request["content-type"],
        properties:
            request.body.properties != null
                ? Object.entries(request.body.properties).map(([propertyKey, propertyDefinition]) =>
                      convertInlinedRequestProperty({
                          propertyKey,
                          propertyDefinition,
                          docs: typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                          file,
                      })
                  )
                : [],
    });
}
