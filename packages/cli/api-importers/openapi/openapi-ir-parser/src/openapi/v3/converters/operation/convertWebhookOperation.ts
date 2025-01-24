import { NamedFullExample, Source, Webhook, WebhookExampleCall, WebhookWithExample } from "@fern-api/openapi-ir";

import { convertToFullExample } from "../../../../schema/examples/convertToFullExample";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
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
}): WebhookWithExample | undefined {
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
        return undefined;
    }

    if (method !== "POST" && method !== "GET") {
        context.logger.error(`Skipping webhook ${method.toUpperCase()} ${path}: Not POST or GET`);
        return undefined;
    }

    const convertedPayload = convertRequest({
        requestBody: operation.requestBody,
        document,
        context,
        requestBreadcrumbs: [...baseBreadcrumbs, "Payload"],
        source,
        namespace: context.namespace
    });

    if (convertedPayload == null || convertedPayload.type !== "json") {
        context.logger.error(`Skipping webhook ${path} because non-json request body`);
        return undefined;
    }

    if (operation.operationId == null) {
        context.logger.error(`Skipping webhook ${path} because no operation id present`);
        return undefined;
    }

    return {
        summary: operation.summary,
        sdkName: sdkMethodName,
        namespace: context.namespace,
        method,
        operationId: operation.operationId,
        tags: context.resolveTagsToTagIds(operation.tags),
        headers: convertedParameters.headers,
        generatedPayloadName: getGeneratedTypeName(payloadBreadcrumbs, context.options.preserveSchemaIds),
        payload: convertedPayload.schema,
        description: operation.description,
        examples: convertWebhookExamples(convertedPayload.fullExamples),
        source
    };
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
