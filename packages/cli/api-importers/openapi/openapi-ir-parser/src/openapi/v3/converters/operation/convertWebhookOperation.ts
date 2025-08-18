import { NamedFullExample, Source, WebhookExampleCall, WebhookWithExample } from "@fern-api/openapi-ir";

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

    const operationId = operation.operationId;
    if (operationId == null) {
        context.logger.error(`Skipping webhook ${path} because no operation id present`);
        return [];
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
