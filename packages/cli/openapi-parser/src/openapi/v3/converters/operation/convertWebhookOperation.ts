import { Webhook } from "@fern-api/openapi-ir-sdk";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { OperationContext } from "../contexts";
import { convertParameters } from "../endpoint/convertParameters";
import { convertRequest } from "../endpoint/convertRequest";

export function convertWebhookOperation({
    context,
    operationContext
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
}): Webhook | undefined {
    const { document, operation, path, method, baseBreadcrumbs, sdkMethodName } = operationContext;
    const payloadBreadcrumbs = [...baseBreadcrumbs, "Payload"];

    const convertedParameters = convertParameters({
        parameters: [...operationContext.pathItemParameters, ...operationContext.operationParameters],
        context,
        requestBreadcrumbs: payloadBreadcrumbs,
        path,
        httpMethod: method
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
        requestBreadcrumbs: [...baseBreadcrumbs, "Payload"]
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
        method,
        operationId: operation.operationId,
        tags: operation.tags ?? [],
        headers: convertedParameters.headers,
        generatedPayloadName: getGeneratedTypeName(payloadBreadcrumbs),
        payload: convertedPayload.schema,
        description: operation.description
    };
}
