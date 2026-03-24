import {
    MultipartFormDataWebhookPayloadWithExample,
    NamedFullExample,
    ObjectPropertyWithExample,
    SchemaWithExample,
    Source,
    WebhookExampleCall,
    WebhookWithExample
} from "@fern-api/openapi-ir";
import { createHash } from "crypto";

import { getExtension } from "../../../../getExtension.js";
import { convertToFullExample } from "../../../../schema/examples/convertToFullExample.js";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName.js";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject.js";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext.js";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions.js";
import { getFernWebhookSignatureExtension } from "../../extensions/getFernWebhookSignatureExtension.js";
import { OperationContext } from "../contexts.js";
import { convertParameters } from "../endpoint/convertParameters.js";
import { convertRequest } from "../endpoint/convertRequest.js";
import { convertResponse } from "../endpoint/convertResponse.js";

export function convertWebhookOperation({
    context,
    operationContext,
    source
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    source: Source;
}): WebhookWithExample[] {
    const { document, operation, path, method, baseBreadcrumbs, sdkMethodName } = operationContext;
    const payloadBreadcrumbs = [...baseBreadcrumbs, "Payload"];
    const responseBreadcrumbs = [...baseBreadcrumbs, "Response"];

    const convertedParameters = convertParameters({
        parameters: [...operationContext.pathItemParameters, ...operationContext.operationParameters],
        context,
        requestBreadcrumbs: payloadBreadcrumbs,
        path,
        httpMethod: method,
        source
    });

    if (method !== "POST" && method !== "GET") {
        context.logger.warn(
            `Skipping webhook ${method.toUpperCase()} ${path}: Only POST and GET methods are currently supported`
        );
        return [];
    }

    const operationId = operation.operationId ?? generateWebhookOperationId({ path, method, sdkMethodName });

    // Parse webhook responses similar to how endpoints do it
    const convertedResponse = operation.responses
        ? convertResponse({
              operationContext,
              streamFormat: undefined,
              responses: operation.responses,
              context,
              responseBreadcrumbs,
              source
          })
        : undefined;

    const signatureVerification = getFernWebhookSignatureExtension(document, operation);

    // For GET webhooks without a request body, synthesize a payload from query parameters
    if (operation.requestBody == null) {
        if (convertedParameters.queryParameters.length === 0) {
            context.logger.error(
                `Skipping webhook ${method.toUpperCase()} ${path}: Missing a request body and no query parameters`
            );
            return [];
        }

        const properties: ObjectPropertyWithExample[] = convertedParameters.queryParameters.map((qp) => ({
            key: qp.name,
            schema: qp.schema,
            readonly: undefined,
            writeonly: undefined,
            audiences: [],
            conflict: {},
            nameOverride: qp.parameterNameOverride,
            generatedName: getGeneratedTypeName([...payloadBreadcrumbs, qp.name], context.options.preserveSchemaIds),
            availability: qp.availability
        }));

        const payload: SchemaWithExample = SchemaWithExample.object({
            description: operation.description,
            properties,
            nameOverride: undefined,
            generatedName: getGeneratedTypeName(payloadBreadcrumbs, context.options.preserveSchemaIds),
            title: undefined,
            allOf: [],
            allOfPropertyConflicts: [],
            namespace: context.namespace,
            groupName: undefined,
            fullExamples: undefined,
            additionalProperties: false,
            availability: undefined,
            encoding: undefined,
            source,
            inline: undefined,
            minProperties: undefined,
            maxProperties: undefined
        });

        const webhook: WebhookWithExample = {
            summary: operation.summary,
            audiences: getExtension<string[]>(operation, FernOpenAPIExtension.AUDIENCES) ?? [],
            sdkName: sdkMethodName,
            namespace: context.namespace,
            method,
            operationId,
            tags: context.resolveTagsToTagIds(operation.tags),
            headers: convertedParameters.headers,
            generatedPayloadName: getGeneratedTypeName(payloadBreadcrumbs, context.options.preserveSchemaIds),
            payload,
            signatureVerification,
            multipartFormData: undefined,
            response: convertedResponse?.value,
            description: operation.description,
            examples: [],
            source
        };
        return [webhook];
    }

    const resolvedRequestBody = isReferenceObject(operation.requestBody)
        ? context.resolveRequestBodyReference(operation.requestBody)
        : operation.requestBody;

    return Object.entries(resolvedRequestBody.content)
        .map(([mediaType, mediaTypeObject]) =>
            convertRequest({
                mediaType,
                mediaTypeObject,
                description: resolvedRequestBody.description,
                document,
                context,
                requestBreadcrumbs: [...baseBreadcrumbs, "Payload"],
                source,
                namespace: context.namespace
            })
        )
        .filter((request) => request != null)
        .map((request) => {
            if (
                request == null ||
                (request.type !== "json" && request.type !== "formUrlEncoded" && request.type !== "multipart")
            ) {
                context.logger.error(
                    `Skipping webhook ${path} because non-json, non-formUrlEncoded, and non-multipart request body`
                );
                return undefined;
            }

            let multipartFormData: MultipartFormDataWebhookPayloadWithExample | undefined;
            let payload: SchemaWithExample;

            if (request.type === "multipart") {
                multipartFormData = {
                    name: request.name,
                    properties: request.properties,
                    description: request.description,
                    source: request.source
                };
                payload = SchemaWithExample.unknown({
                    nameOverride: undefined,
                    generatedName: getGeneratedTypeName(payloadBreadcrumbs, context.options.preserveSchemaIds),
                    title: undefined,
                    description: request.description,
                    availability: undefined,
                    namespace: context.namespace,
                    groupName: undefined,
                    example: undefined
                });
            } else {
                payload = request.schema;
            }

            const webhook: WebhookWithExample = {
                summary: operation.summary,
                audiences: getExtension<string[]>(operation, FernOpenAPIExtension.AUDIENCES) ?? [],
                sdkName: sdkMethodName,
                namespace: context.namespace,
                method,
                operationId,
                tags: context.resolveTagsToTagIds(operation.tags),
                headers: convertedParameters.headers,
                generatedPayloadName: getGeneratedTypeName(payloadBreadcrumbs, context.options.preserveSchemaIds),
                payload,
                signatureVerification,
                multipartFormData,
                response: convertedResponse?.value,
                description: operation.description,
                examples: convertWebhookExamples(request.fullExamples),
                source
            };
            return webhook;
        })
        .filter((request) => request != null);
}

function convertWebhookExamples(payloadExamples: NamedFullExample[] | undefined): WebhookExampleCall[] {
    if (payloadExamples == null) {
        return [];
    }
    const webhookExampleCalls: WebhookExampleCall[] = [];
    for (const payloadExample of payloadExamples) {
        const fullExample = convertToFullExample(payloadExample.value);
        if (fullExample == null) {
            continue;
        }
        webhookExampleCalls.push({
            description: payloadExample.description,
            name: payloadExample.name,
            payload: fullExample
        });
    }
    return webhookExampleCalls;
}

function generateWebhookOperationId({
    path,
    method,
    sdkMethodName
}: {
    path: string;
    method: string;
    sdkMethodName: { methodName: string } | undefined;
}): string {
    // Option A: Use the webhook key name directly (clean, human-readable)
    // with a fallback to method+hash for paths that contain special characters
    if (sdkMethodName?.methodName != null) {
        return sdkMethodName.methodName;
    }
    const sanitized = sanitizePathExpression(path);
    if (sanitized === path.toLowerCase()) {
        // Path is clean (no special characters were removed), use it directly
        return path;
    }
    // Fallback: path had special characters, use sanitized + method + hash for uniqueness
    const hash = createHash("sha256").update(path).digest("hex").slice(0, 8);
    return toCamelCase(`${sanitized}_${method.toLowerCase()}_${hash}`);
}

function sanitizePathExpression(path: string): string {
    return path
        .replace(/[{$}#]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .replace(/_+/g, "_")
        .toLowerCase()
        .slice(0, 64);
}

function toCamelCase(str: string): string {
    return str
        .split("_")
        .map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
}
