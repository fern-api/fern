import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    AsymmetricAlgorithm,
    Webhook,
    WebhookPayloadBodySort,
    WebhookPayloadComponent,
    WebhookPayloadFormat,
    WebhookSignatureAlgorithm,
    WebhookSignatureEncoding,
    WebhookSignatureVerification,
    WebhookTimestamp,
    WebhookTimestampFormat
} from "@fern-api/openapi-ir";
import { join, RelativeFilePath } from "@fern-api/path-utils";
import { CliError } from "@fern-api/task-context";
import { camelCase, isEqual } from "lodash-es";
import { buildHeader } from "./buildHeader.js";
import { buildTypeReference } from "./buildTypeReference.js";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { convertFullExample } from "./utils/convertFullExample.js";
import { convertEndpointSdkNameToFile } from "./utils/convertSdkGroupName.js";
import { tokenizeString } from "./utils/getEndpointLocation.js";
import { getEndpointNamespace } from "./utils/getNamespaceFromGroup.js";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference.js";

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
            audiences: webhook.audiences,
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
            signature: convertSignatureVerification(webhook.signatureVerification),
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
                    throw new CliError({
                        message: "Unrecognized Response type: " + webhook.response?.type,
                        code: CliError.Code.InternalError
                    });
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

function convertSignatureVerification(
    signatureVerification: WebhookSignatureVerification | undefined
): RawSchemas.WebhookSignatureSchema | undefined {
    if (signatureVerification == null) {
        return undefined;
    }

    switch (signatureVerification.type) {
        case "hmac":
            return {
                type: "hmac",
                header: signatureVerification.header,
                algorithm: convertSignatureAlgorithm(signatureVerification.algorithm),
                encoding: convertSignatureEncoding(signatureVerification.encoding),
                "signature-prefix": signatureVerification.signaturePrefix,
                "payload-format": convertPayloadFormat(signatureVerification.payloadFormat),
                timestamp: convertTimestamp(signatureVerification.timestamp)
            };
        case "asymmetric":
            return {
                type: "asymmetric",
                header: signatureVerification.header,
                "asymmetric-algorithm": convertAsymmetricAlgorithm(signatureVerification.asymmetricAlgorithm),
                encoding: convertSignatureEncoding(signatureVerification.encoding),
                "signature-prefix": signatureVerification.signaturePrefix,
                "jwks-url": signatureVerification.jwksUrl,
                "key-id-header": signatureVerification.keyIdHeader,
                timestamp: convertTimestamp(signatureVerification.timestamp)
            };
        default:
            return undefined;
    }
}

function convertSignatureAlgorithm(
    algorithm: WebhookSignatureAlgorithm | undefined
): RawSchemas.WebhookSignatureAlgorithmSchema | undefined {
    if (algorithm == null) {
        return undefined;
    }
    switch (algorithm) {
        case "sha256":
            return "sha256";
        case "sha1":
            return "sha1";
        case "sha384":
            return "sha384";
        case "sha512":
            return "sha512";
        default:
            return undefined;
    }
}

function convertSignatureEncoding(
    encoding: WebhookSignatureEncoding | undefined
): RawSchemas.WebhookSignatureEncodingSchema | undefined {
    if (encoding == null) {
        return undefined;
    }
    switch (encoding) {
        case "base64":
            return "base64";
        case "hex":
            return "hex";
        default:
            return undefined;
    }
}

function convertAsymmetricAlgorithm(algorithm: AsymmetricAlgorithm): RawSchemas.AsymmetricAlgorithmSchema {
    switch (algorithm) {
        case "rsa-sha256":
            return "rsa-sha256";
        case "rsa-sha384":
            return "rsa-sha384";
        case "rsa-sha512":
            return "rsa-sha512";
        case "ecdsa-sha256":
            return "ecdsa-sha256";
        case "ecdsa-sha384":
            return "ecdsa-sha384";
        case "ecdsa-sha512":
            return "ecdsa-sha512";
        case "ed25519":
            return "ed25519";
        default:
            return "rsa-sha256";
    }
}

function convertPayloadFormat(
    payloadFormat: WebhookPayloadFormat | undefined
): RawSchemas.WebhookPayloadFormatSchema | undefined {
    if (payloadFormat == null) {
        return undefined;
    }
    return {
        components: payloadFormat.components.map(convertPayloadComponent),
        delimiter: payloadFormat.delimiter,
        "body-sort": convertBodySort(payloadFormat.bodySort)
    };
}

function convertBodySort(
    bodySort: WebhookPayloadBodySort | undefined
): RawSchemas.WebhookPayloadBodySortSchema | undefined {
    if (bodySort == null) {
        return undefined;
    }
    switch (bodySort) {
        case "alphabetical":
            return "alphabetical";
        default:
            return undefined;
    }
}

function convertPayloadComponent(component: WebhookPayloadComponent): RawSchemas.WebhookPayloadComponentSchema {
    switch (component) {
        case "body":
            return "body";
        case "timestamp":
            return "timestamp";
        case "notification-url":
            return "notification-url";
        case "message-id":
            return "message-id";
        default:
            return "body";
    }
}

function convertTimestampFormat(format: WebhookTimestampFormat): RawSchemas.WebhookTimestampFormatSchema | undefined {
    switch (format) {
        case "unix-seconds":
            return "unix-seconds";
        case "unix-millis":
            return "unix-millis";
        case "iso8601":
            return "iso8601";
        default:
            return undefined;
    }
}

function convertTimestamp(timestamp: WebhookTimestamp | undefined): RawSchemas.WebhookTimestampSchema | undefined {
    if (timestamp == null) {
        return undefined;
    }
    return {
        header: timestamp.header,
        format: timestamp.format != null ? convertTimestampFormat(timestamp.format) : undefined,
        tolerance: timestamp.tolerance
    };
}
