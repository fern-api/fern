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
    Availability,
    ExampleWebhookCall,
    HttpResponse,
    HttpResponseBody,
    InlinedWebhookPayloadProperty,
    JsonResponse,
    StreamingResponse,
    Webhook,
    WebhookGroup,
    WebhookPayload
} from "@fern-api/ir-sdk";
import { IdGenerator, isReferencedWebhookPayloadSchema } from "@fern-api/ir-utils";

import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { parseTypeName } from "../utils/parseTypeName";
import { convertAvailability } from "./convertDeclaration";
import { convertHttpHeader } from "./services/convertHttpService";
import { getObjectPropertyFromResolvedType } from "./services/getObjectPropertyFromResolvedType";
import { convertTypeReferenceExample } from "./type-declarations/convertExampleType";
import { getExtensionsAsList, getPropertyName } from "./type-declarations/convertObjectTypeDeclaration";

export function convertWebhookGroup({
    webhooks,
    file,
    typeResolver,
    exampleResolver,
    workspace
}: {
    webhooks: Record<string, RawSchemas.WebhookSchema>;
    file: FernFileContext;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    workspace: FernWorkspace;
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
            responses.push({
                body: HttpResponseBody.streaming(streamResponse),
                statusCode: undefined,
                isWildcardStatusCode: undefined,
                docs: typeof webhook.response !== "string" ? webhook.response?.docs : undefined
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
