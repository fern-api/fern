import { IrVersions } from "../../ir-versions";
import { convertName, convertNameAndWireValue } from "./convertCommons";
import { convertTypeReference } from "./convertTypes";

function convertWebhookGroup(webhookGroup: IrVersions.V61.WebhookGroup): IrVersions.V60.WebhookGroup {
    return {
        ...webhookGroup,
        name: convertNameAndWireValue(webhookGroup.name),
        headers: webhookGroup.headers.map(header => ({
            ...header,
            name: convertNameAndWireValue(header.name),
            valueType: convertTypeReference(header.valueType)
        })),
        webhook: convertWebhook(webhookGroup.webhook)
    };
}

function convertWebhook(webhook: IrVersions.V61.Webhook): IrVersions.V60.Webhook {
    return {
        ...webhook,
        name: convertName(webhook.name),
        headers: webhook.headers.map(header => ({
            ...header,
            name: convertNameAndWireValue(header.name),
            valueType: convertTypeReference(header.valueType)
        })),
        payload: convertWebhookPayload(webhook.payload)
    };
}

function convertWebhookPayload(payload: IrVersions.V61.WebhookPayload): IrVersions.V60.WebhookPayload {
    switch (payload.type) {
        case "inlinedPayload":
            return {
                ...payload,
                name: convertName(payload.name),
                extends: payload.extends.map(convertDeclaredTypeName),
                properties: payload.properties.map(property => ({
                    ...property,
                    name: convertNameAndWireValue(property.name),
                    valueType: convertTypeReference(property.valueType)
                }))
            };
        case "reference":
            return {
                ...payload,
                payloadType: convertTypeReference(payload.payloadType)
            };
        default:
            return assertNever(payload);
    }
}
