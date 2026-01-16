import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Webhook } from "@fern-api/openapi-ir";
import { join, RelativeFilePath } from "@fern-api/path-utils";
import { camelCase, isEqual } from "lodash-es";
import { buildHeader } from "./buildHeader";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { convertFullExample } from "./utils/convertFullExample";
import { convertEndpointSdkNameToFile } from "./utils/convertSdkGroupName";
import { tokenizeString } from "./utils/getEndpointLocation";
import { getEndpointNamespace } from "./utils/getNamespaceFromGroup";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

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

        let payload: RawSchemas.WebhookPayloadSchema | undefined;

        webhook.payload._visit({
            json: (jsonPayload) => {
                payload = buildTypeReference({
                    schema: jsonPayload,
                    context,
                    fileContainingReference: webhookLocation.file,
                    namespace: maybeWebhookNamespace,
                    declarationDepth: 0
                });
            },
            multipart: (multipartPayload) => {
                const properties = Object.fromEntries(
                    multipartPayload.properties.map((property) => {
                        if (property.schema.type === "file") {
                            let fileType = property.schema.isArray ? "list<file>" : "file";
                            fileType = property.schema.isOptional ? `optional<${fileType}>` : fileType;
                            if (property.description != null) {
                                const propertyTypeReference: RawSchemas.ObjectPropertySchema = {
                                    type: fileType,
                                    docs: property.description
                                };
                                return [property.key, propertyTypeReference];
                            }
                            return [property.key, fileType];
                        } else {
                            const propertyTypeReference: RawSchemas.ObjectPropertySchema = buildTypeReference({
                                schema: property.schema.value,
                                fileContainingReference: webhookLocation.file,
                                context,
                                namespace: maybeWebhookNamespace,
                                declarationDepth: 1
                            });
                            return [property.key, propertyTypeReference];
                        }
                    })
                );
                payload = {
                    name: multipartPayload.name ?? webhook.generatedPayloadName,
                    properties
                };
            },
            _other: () => {
                throw new Error("Unrecognized WebhookPayload type: " + webhook.payload.type);
            }
        });

        const webhookDefinition: RawSchemas.WebhookSchema = {
            audiences: webhook.audiences,
            method: webhook.method,
            "display-name": webhook.summary ?? undefined,
            headers,
            payload,
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

        // Add response if it exists
        if (webhook.response != null) {
            webhook.response._visit({
                json: (jsonResponse) => {
                    const responseTypeReference = buildTypeReference({
                        schema: jsonResponse.schema,
                        context,
                        fileContainingReference: webhookLocation.file,
                        namespace: maybeWebhookNamespace,
                        declarationDepth: 0
                    });
                    webhookDefinition.response = {
                        docs: jsonResponse.description ?? undefined,
                        type: getTypeFromTypeReference(responseTypeReference)
                    };
                    if (jsonResponse.statusCode != null) {
                        webhookDefinition.response["status-code"] = jsonResponse.statusCode;
                    }
                },
                file: (fileResponse) => {
                    webhookDefinition.response = {
                        docs: fileResponse.description ?? undefined,
                        type: "file",
                        "status-code": fileResponse.statusCode
                    };
                },
                bytes: (bytesResponse) => {
                    webhookDefinition.response = {
                        docs: bytesResponse.description ?? undefined,
                        type: "bytes",
                        "status-code": bytesResponse.statusCode
                    };
                },
                text: (textResponse) => {
                    webhookDefinition.response = {
                        docs: textResponse.description ?? undefined,
                        type: "text",
                        "status-code": textResponse.statusCode
                    };
                },
                streamingJson: (jsonResponse) => {
                    const responseTypeReference = buildTypeReference({
                        schema: jsonResponse.schema,
                        context,
                        fileContainingReference: webhookLocation.file,
                        namespace: maybeWebhookNamespace,
                        declarationDepth: 0
                    });
                    webhookDefinition["response-stream"] = {
                        docs: jsonResponse.description ?? undefined,
                        type: getTypeFromTypeReference(responseTypeReference),
                        format: "json"
                    };
                },
                streamingSse: (jsonResponse) => {
                    const responseTypeReference = buildTypeReference({
                        schema: jsonResponse.schema,
                        context,
                        fileContainingReference: webhookLocation.file,
                        namespace: maybeWebhookNamespace,
                        declarationDepth: 0
                    });
                    webhookDefinition["response-stream"] = {
                        docs: jsonResponse.description ?? undefined,
                        type: getTypeFromTypeReference(responseTypeReference),
                        format: "sse"
                    };
                },
                streamingText: (textResponse) => {
                    webhookDefinition["response-stream"] = {
                        docs: textResponse.description ?? undefined,
                        type: "text"
                    };
                },
                _other: () => {
                    throw new Error("Unrecognized Response type: " + webhook.response?.type);
                }
            });
        }
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
