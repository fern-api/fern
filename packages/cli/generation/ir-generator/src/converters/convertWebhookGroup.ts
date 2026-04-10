import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import {
    isRawTextType,
    parseRawBytesType,
    parseRawFileType,
    parseRawTextType,
    RawSchemas
} from "@fern-api/fern-definition-schema";
import {
    AsymmetricAlgorithm,
    AsymmetricKeySignatureVerification,
    AsymmetricKeySource,
    Availability,
    ExampleWebhookCall,
    HmacAlgorithm,
    HmacSignatureVerification,
    HttpResponse,
    HttpResponseBody,
    InlinedWebhookPayloadProperty,
    JsonResponse,
    StreamingResponse,
    Webhook,
    WebhookGroup,
    WebhookPayload,
    WebhookPayloadBodySort,
    WebhookPayloadComponent,
    WebhookPayloadFormat,
    WebhookSignatureEncoding,
    WebhookSignatureVerification,
    WebhookTimestampConfig,
    WebhookTimestampFormat
} from "@fern-api/ir-sdk";
import { IdGenerator, isReferencedWebhookPayloadSchema } from "@fern-api/ir-utils";

import { FernFileContext } from "../FernFileContext.js";
import { ExampleResolver } from "../resolvers/ExampleResolver.js";
import { TypeResolver } from "../resolvers/TypeResolver.js";
import { parseTypeName } from "../utils/parseTypeName.js";
import { convertAvailability } from "./convertDeclaration.js";
import { convertHttpHeader } from "./services/convertHttpService.js";
import { getObjectPropertyFromResolvedType } from "./services/getObjectPropertyFromResolvedType.js";
import { convertTypeReferenceExample } from "./type-declarations/convertExampleType.js";
import { getExtensionsAsList, getPropertyName } from "./type-declarations/convertObjectTypeDeclaration.js";

export function convertWebhookGroup({
    webhooks,
    file,
    typeResolver,
    exampleResolver,
    workspace,
    defaultSignature
}: {
    webhooks: Record<string, RawSchemas.WebhookSchema>;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
    defaultSignature?: RawSchemas.WebhookSignatureSchema;
}): WebhookGroup {
    const webhookGroup: Webhook[] = [];
    for (const [webhookId, webhook] of Object.entries(webhooks)) {
        webhookGroup.push({
            id: IdGenerator.generateWebhookId(file.fernFilepath, webhookId),
            availability: convertAvailability(webhook.availability),
            displayName: webhook["display-name"],
            docs: webhook.docs,
            method: webhook.method,
            name: file.casingsGenerator.generateName(webhookId),
            headers:
                webhook.headers != null
                    ? Object.entries(webhook.headers).map(([headerKey, header]) =>
                          convertHttpHeader({ headerKey, header, file })
                      )
                    : [],
            payload: convertWebhookPayloadSchema({ payload: webhook.payload, file }),
            signatureVerification: convertWebhookSignatureSchema({
                signature: webhook.signature ?? defaultSignature,
                file
            }),
            fileUploadPayload: undefined,
            responses: convertWebhookResponses({ webhook, file, typeResolver }),
            examples:
                webhook.examples != null
                    ? convertWebhookExamples({
                          webhook,
                          examples: webhook.examples,
                          file,
                          typeResolver,
                          exampleResolver,
                          workspace
                      })
                    : undefined,
            v2Examples: undefined
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
                              availability:
                                  typeof propertyDefinition !== "string"
                                      ? convertAvailability(propertyDefinition.availability)
                                      : undefined,
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
    availability,
    file
}: {
    propertyKey: string;
    propertyDefinition: RawSchemas.ObjectPropertySchema;
    docs: string | undefined;
    availability: Availability | undefined;
    file: FernFileContext;
}): InlinedWebhookPayloadProperty {
    return {
        docs,
        availability,
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name
        }),
        valueType: file.parseTypeReference(propertyDefinition)
    };
}

function convertWebhookExamples({
    webhook,
    examples,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    webhook: RawSchemas.WebhookSchema;
    examples: RawSchemas.ExampleWebhookCallSchema[];
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
}): ExampleWebhookCall[] {
    const typeName =
        typeof webhook.payload === "string"
            ? webhook.payload
            : isReferencedWebhookPayloadSchema(webhook.payload)
              ? webhook.payload.type
              : undefined;
    if (typeName != null) {
        return examples.map((example) => ({
            docs: webhook.docs,
            name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
            payload: convertTypeReferenceExample({
                example: example.payload,
                rawTypeBeingExemplified: typeName,
                fileContainingRawTypeReference: file,
                fileContainingExample: file,
                typeResolver,
                exampleResolver,
                workspace
            })
        }));
    }
    if (!isPlainObject(webhook.payload)) {
        throw new Error(`Example webhook payload is not an object. Got: ${JSON.stringify(webhook.payload)}`);
    }
    // The payload example is a simple object of key, value pairs, so we format the example as
    // a map<string, unknown> for simplicity. If we ever add support for webhooks in the generated
    // SDKs, we'll need to revisit this.
    return examples.map((example) => ({
        docs: webhook.docs,
        name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
        payload: convertTypeReferenceExample({
            example: example.payload,
            rawTypeBeingExemplified: "map<string, unknown>",
            fileContainingRawTypeReference: file,
            fileContainingExample: file,
            typeResolver,
            exampleResolver,
            workspace
        })
    }));
}

function convertWebhookResponses({
    webhook,
    file,
    typeResolver
}: {
    webhook: RawSchemas.WebhookSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponse[] | undefined {
    const responses: HttpResponse[] = [];

    // Convert response
    if (webhook.response != null) {
        const responseBody = convertWebhookResponseBody({ response: webhook.response, file, typeResolver });
        const statusCode = typeof webhook.response !== "string" ? webhook.response["status-code"] : undefined;
        const docs = typeof webhook.response !== "string" ? webhook.response.docs : undefined;
        responses.push({
            body: responseBody,
            statusCode,
            isWildcardStatusCode: undefined,
            docs
        });
    }

    // Convert response-stream
    if (webhook["response-stream"] != null) {
        const streamResponse = convertWebhookStreamResponseBody({
            responseStream: webhook["response-stream"],
            file,
            typeResolver
        });
        if (streamResponse != null) {
            const streamDocs =
                typeof webhook["response-stream"] !== "string" ? webhook["response-stream"].docs : undefined;
            responses.push({
                body: HttpResponseBody.streaming(streamResponse),
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: streamDocs
            });
        }
    }

    return responses.length > 0 ? responses : undefined;
}

function convertWebhookResponseBody({
    response,
    file,
    typeResolver
}: {
    response: RawSchemas.HttpResponseSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponseBody.FileDownload | HttpResponseBody.Text | HttpResponseBody.Json | HttpResponseBody.Bytes | undefined {
    const docs = typeof response !== "string" ? response.docs : undefined;
    const responseType = typeof response === "string" ? response : response.type;

    if (responseType != null) {
        if (parseRawFileType(responseType) != null) {
            return HttpResponseBody.fileDownload({
                docs,
                v2Examples: undefined
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponseBody.text({
                docs,
                v2Examples: undefined
            });
        } else if (parseRawBytesType(responseType) != null) {
            return HttpResponseBody.bytes({
                docs,
                v2Examples: undefined
            });
        } else {
            return convertWebhookJsonResponse(response, docs, file, typeResolver);
        }
    }

    return undefined;
}

function convertWebhookStreamResponseBody({
    responseStream,
    file,
    typeResolver
}: {
    responseStream: RawSchemas.HttpResponseStreamSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): StreamingResponse | undefined {
    const docs = typeof responseStream !== "string" ? responseStream.docs : undefined;
    const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
    const streamFormat = typeof responseStream === "string" ? "json" : (responseStream.format ?? "json");

    if (isRawTextType(typeReference)) {
        return StreamingResponse.text({
            docs,
            v2Examples: undefined
        });
    } else if (typeof responseStream !== "string" && streamFormat === "sse") {
        return StreamingResponse.sse({
            docs,
            payload: file.parseTypeReference(typeReference),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
            v2Examples: undefined
        });
    } else {
        return StreamingResponse.json({
            docs,
            payload: file.parseTypeReference(typeReference),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
            v2Examples: undefined
        });
    }
}

function convertWebhookJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): HttpResponseBody.Json | undefined {
    const responseTypeReference = typeof response !== "string" ? response.type : response;
    if (responseTypeReference == null) {
        return undefined;
    }
    const responseBodyType = file.parseTypeReference(
        typeof response === "string" ? response : { ...response, type: responseTypeReference }
    );
    const resolvedType = typeResolver.resolveTypeOrThrow({
        type: responseTypeReference,
        file
    });
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponseBody.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty: getObjectPropertyFromResolvedType({
                    typeResolver,
                    file,
                    resolvedType,
                    property: responseProperty
                }),
                v2Examples: undefined
            })
        );
    }
    return HttpResponseBody.json(
        JsonResponse.response({
            docs,
            responseBodyType,
            v2Examples: undefined
        })
    );
}

function convertWebhookSignatureSchema({
    signature,
    file
}: {
    signature: RawSchemas.WebhookSignatureSchema | undefined;
    file: FernFileContext;
}): WebhookSignatureVerification | undefined {
    if (signature == null) {
        return undefined;
    }

    switch (signature.type) {
        case "hmac":
            return WebhookSignatureVerification.hmac(convertHmacSignature({ hmac: signature, file }));
        case "asymmetric":
            return WebhookSignatureVerification.asymmetric(convertAsymmetricSignature({ asymmetric: signature, file }));
        default:
            return undefined;
    }
}

function convertHmacSignature({
    hmac,
    file
}: {
    hmac: RawSchemas.HmacSignatureSchema;
    file: FernFileContext;
}): HmacSignatureVerification {
    return {
        signatureHeaderName: file.casingsGenerator.generateNameAndWireValue({
            wireValue: hmac.header,
            name: hmac.header
        }),
        algorithm: convertHmacAlgorithm(hmac.algorithm),
        encoding: convertSignatureEncoding(hmac.encoding),
        signaturePrefix: hmac["signature-prefix"],
        payloadFormat: convertPayloadFormat(hmac["payload-format"]),
        timestamp: convertTimestampConfig({ timestamp: hmac.timestamp, file })
    };
}

function convertAsymmetricSignature({
    asymmetric,
    file
}: {
    asymmetric: RawSchemas.AsymmetricSignatureSchema;
    file: FernFileContext;
}): AsymmetricKeySignatureVerification {
    return {
        signatureHeaderName: file.casingsGenerator.generateNameAndWireValue({
            wireValue: asymmetric.header,
            name: asymmetric.header
        }),
        algorithm: convertAsymmetricAlgorithm(asymmetric["asymmetric-algorithm"]),
        encoding: convertSignatureEncoding(asymmetric.encoding),
        signaturePrefix: asymmetric["signature-prefix"],
        keySource: convertKeySource({ asymmetric, file }),
        timestamp: convertTimestampConfig({ timestamp: asymmetric.timestamp, file })
    };
}

function convertHmacAlgorithm(algorithm: RawSchemas.WebhookSignatureAlgorithmSchema | undefined): HmacAlgorithm {
    switch (algorithm) {
        case "sha1":
            return HmacAlgorithm.Sha1;
        case "sha384":
            return HmacAlgorithm.Sha384;
        case "sha512":
            return HmacAlgorithm.Sha512;
        case "sha256":
        case undefined:
            return HmacAlgorithm.Sha256;
    }
}

function convertSignatureEncoding(
    encoding: RawSchemas.WebhookSignatureEncodingSchema | undefined
): WebhookSignatureEncoding {
    switch (encoding) {
        case "hex":
            return WebhookSignatureEncoding.Hex;
        case "base64":
        case undefined:
            return WebhookSignatureEncoding.Base64;
    }
}

function convertAsymmetricAlgorithm(algorithm: RawSchemas.AsymmetricAlgorithmSchema): AsymmetricAlgorithm {
    switch (algorithm) {
        case "rsa-sha256":
            return AsymmetricAlgorithm.RsaSha256;
        case "rsa-sha384":
            return AsymmetricAlgorithm.RsaSha384;
        case "rsa-sha512":
            return AsymmetricAlgorithm.RsaSha512;
        case "ecdsa-sha256":
            return AsymmetricAlgorithm.EcdsaSha256;
        case "ecdsa-sha384":
            return AsymmetricAlgorithm.EcdsaSha384;
        case "ecdsa-sha512":
            return AsymmetricAlgorithm.EcdsaSha512;
        case "ed25519":
            return AsymmetricAlgorithm.Ed25519;
    }
}

function convertKeySource({
    asymmetric,
    file
}: {
    asymmetric: RawSchemas.AsymmetricSignatureSchema;
    file: FernFileContext;
}): AsymmetricKeySource {
    if (asymmetric["jwks-url"] != null) {
        return AsymmetricKeySource.jwks({
            url: asymmetric["jwks-url"],
            keyIdHeader:
                asymmetric["key-id-header"] != null
                    ? file.casingsGenerator.generateNameAndWireValue({
                          wireValue: asymmetric["key-id-header"],
                          name: asymmetric["key-id-header"]
                      })
                    : undefined
        });
    }
    return AsymmetricKeySource.static({});
}

function convertPayloadFormat(payloadFormat: RawSchemas.WebhookPayloadFormatSchema | undefined): WebhookPayloadFormat {
    if (payloadFormat == null) {
        return {
            components: [WebhookPayloadComponent.Body],
            delimiter: "",
            bodySort: undefined
        };
    }
    return {
        components: payloadFormat.components.map(convertPayloadComponent),
        delimiter: payloadFormat.delimiter ?? "",
        bodySort: convertBodySort(payloadFormat["body-sort"])
    };
}

function convertBodySort(
    bodySort: RawSchemas.WebhookPayloadBodySortSchema | undefined
): WebhookPayloadBodySort | undefined {
    switch (bodySort) {
        case "alphabetical":
            return WebhookPayloadBodySort.Alphabetical;
        case undefined:
            return undefined;
    }
}

function convertPayloadComponent(component: RawSchemas.WebhookPayloadComponentSchema): WebhookPayloadComponent {
    switch (component) {
        case "body":
            return WebhookPayloadComponent.Body;
        case "timestamp":
            return WebhookPayloadComponent.Timestamp;
        case "notification-url":
            return WebhookPayloadComponent.NotificationUrl;
        case "message-id":
            return WebhookPayloadComponent.MessageId;
    }
}

function convertTimestampConfig({
    timestamp,
    file
}: {
    timestamp: RawSchemas.WebhookTimestampSchema | undefined;
    file: FernFileContext;
}): WebhookTimestampConfig | undefined {
    if (timestamp == null) {
        return undefined;
    }
    return {
        headerName: file.casingsGenerator.generateNameAndWireValue({
            wireValue: timestamp.header,
            name: timestamp.header
        }),
        format: convertTimestampFormat(timestamp.format),
        tolerance: timestamp.tolerance
    };
}

function convertTimestampFormat(format: RawSchemas.WebhookTimestampFormatSchema | undefined): WebhookTimestampFormat {
    switch (format) {
        case "unix-millis":
            return WebhookTimestampFormat.UnixMillis;
        case "iso8601":
            return WebhookTimestampFormat.Iso8601;
        case "unix-seconds":
        case undefined:
            return WebhookTimestampFormat.UnixSeconds;
    }
}
