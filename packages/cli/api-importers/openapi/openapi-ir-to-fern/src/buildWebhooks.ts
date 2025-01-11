import { camelCase, isEqual } from "lodash-es";

import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Webhook } from "@fern-api/openapi-ir";
import { RelativeFilePath, join } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { buildHeader } from "./buildHeader";
import { buildTypeReference } from "./buildTypeReference";
import { convertFullExample } from "./utils/convertFullExample";
import { convertEndpointSdkNameToFile } from "./utils/convertSdkGroupName";
import { tokenizeString } from "./utils/getEndpointLocation";
import { getEndpointNamespace } from "./utils/getNamespaceFromGroup";

export function buildWebhooks(context: OpenApiIrConverterContext): void {
    for (const webhook of context.ir.webhooks) {
        const webhookLocation = getWebhookLocation({ webhook, context });
        if (webhookLocation == null) {
            continue;
        }

        const maybeWebhookNamespace = getEndpointNamespace(webhook.sdkName, webhook.namespace);

        const headers: Record<string, RawSchemas.HttpHeaderSchema> = {};
        for (const header of webhook.headers) {
            headers[header.name] = buildHeader({
                header,
                context,
                fileContainingReference: webhookLocation.file,
                namespace: maybeWebhookNamespace
            });
        }

        const webhookDefinition: RawSchemas.WebhookSchema = {
            method: webhook.method,
            "display-name": webhook.summary ?? undefined,
            headers,
            payload: buildTypeReference({
                schema: webhook.payload,
                context,
                fileContainingReference: webhookLocation.file,
                namespace: maybeWebhookNamespace,
                declarationDepth: 0
            }),
            examples:
                webhook.examples != null
                    ? webhook.examples.map((exampleWebhookCall) => {
                          return {
                              docs: exampleWebhookCall.description,
                              name: exampleWebhookCall.name,
                              payload: convertFullExample(exampleWebhookCall.payload)
                          };
                      })
                    : undefined
        };
        context.builder.addWebhook(webhookLocation.file, {
            name: webhookLocation.endpointId,
            schema: webhookDefinition
        });

        if (webhook.description != null) {
            webhookDefinition.docs = webhook.description;
        }
    }
}

export interface WebhookLocation {
    file: RelativeFilePath;
    endpointId: string;
    tag?: string;
}

function resolveWebhookLocationWithNamespaceOverride({
    location,
    namespaceOverride
}: {
    location: WebhookLocation | undefined;
    namespaceOverride: string | undefined;
}): WebhookLocation | undefined {
    if (location == null) {
        return undefined;
    }
    if (namespaceOverride != null) {
        return {
            ...location,
            file: join(RelativeFilePath.of(namespaceOverride), location.file)
        };
    }
    return location;
}

function getUnresolvedWebhookLocation({
    webhook,
    context
}: {
    webhook: Webhook;
    context: OpenApiIrConverterContext;
}): WebhookLocation | undefined {
    const tag = webhook.tags[0];
    const operationId = webhook.operationId;

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: operationId
        };
    }

    // if both tag and operation ids are defined
    const tagTokens = tokenizeString(tag);
    const operationIdTokens = tokenizeString(operationId);

    // add to __package__.yml if equal
    if (isEqual(tagTokens, operationIdTokens)) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            endpointId: tag
        };
    }

    const fileParts: string[] = [];
    for (let i = 0; i < tagTokens.length; ++i) {
        const tagElement = tagTokens[i];
        if (tagElement != null && tagElement === operationIdTokens[i]) {
            fileParts.push(tagElement);
        } else {
            // tag and operation id don't overlap, so just return operation id
            const camelCasedTag = camelCase(tag);
            return {
                file: RelativeFilePath.of(`${camelCasedTag}.yml`),
                endpointId: operationId,
                tag
            };
        }
    }

    if (fileParts.length >= operationIdTokens.length) {
        context.logger.warn(`Skipping webhook ${webhook.operationId} because couldn't compute file location`);
        return undefined;
    }

    return {
        file: RelativeFilePath.of(camelCase(fileParts.join("_")) + ".yml"),
        endpointId: camelCase(operationIdTokens.slice(fileParts.length).join("_")),
        tag
    };
}

function getWebhookLocation({
    webhook,
    context
}: {
    webhook: Webhook;
    context: OpenApiIrConverterContext;
}): WebhookLocation | undefined {
    if (webhook.sdkName != null) {
        return {
            file: convertEndpointSdkNameToFile({ sdkName: webhook.sdkName, namespaceOverride: webhook.namespace }),
            endpointId: webhook.sdkName.methodName
        };
    }

    return resolveWebhookLocationWithNamespaceOverride({
        namespaceOverride: webhook.namespace,
        location: getUnresolvedWebhookLocation({ webhook, context })
    });
}
