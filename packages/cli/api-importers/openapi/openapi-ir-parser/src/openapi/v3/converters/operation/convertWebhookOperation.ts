import { NamedFullExample, Source, WebhookExampleCall, WebhookWithExample } from "@fern-api/openapi-ir";
import { createHash } from "crypto";

import { getExtension } from "../../../../getExtension";
import { convertToFullExample } from "../../../../schema/examples/convertToFullExample";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { OperationContext } from "../contexts";
import { convertParameters } from "../endpoint/convertParameters";
import { convertRequest } from "../endpoint/convertRequest";

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

    const convertedParameters = convertParameters({
        parameters: [...operationContext.pathItemParameters, ...operationContext.operationParameters],
        context,
        requestBreadcrumbs: payloadBreadcrumbs,
        path,
        httpMethod: method,
        source
    });

    if (operation.requestBody == null) {
        context.logger.error(`Skipping webhook ${method.toUpperCase()} ${path}: Missing a request body`);
        return [];
    }

    let operationId = operation.operationId;

    if (operationId == null) {
        operationId = generateWebhookOperationId({ path, method, sdkMethodName });
        context.logger.debug(
            `Generated synthetic operation ID for webhook ${method.toUpperCase()} ${path}: ${operationId}`
        );
    }

    if (method !== "POST" && method !== "GET") {
        context.logger.error(`Skipping webhook ${method.toUpperCase()} ${path}: Not POST or GET`);
        return [];
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
            if (request == null || (request.type !== "json" && request.type !== "formUrlEncoded")) {
                context.logger.error(`Skipping webhook ${path} because non-json and non-formUrlEncoded request body`);
                return undefined;
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
                payload: request.schema,
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
    const base = sdkMethodName?.methodName ?? sanitizePathExpression(path);
    const hash = createHash("sha256").update(path).digest("hex").slice(0, 8);
    return toCamelCase(`${base}_${method.toLowerCase()}_${hash}`);
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
