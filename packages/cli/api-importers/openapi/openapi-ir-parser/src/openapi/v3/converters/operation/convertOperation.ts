import { camelCase } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";

import {
    EndpointSdkName,
    EndpointWithExample,
    HttpMethod,
    SdkGroupName,
    WebhookWithExample
} from "@fern-api/openapi-ir";

import { getExtension } from "../../../../getExtension";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getFernAsyncExtension } from "../../extensions/getFernAsyncExtension";
import { getFernStreamingExtension } from "../../extensions/getFernStreamingExtension";
import { getFernPaginationExtension } from "../../extensions/getPaginationExtension";
import { OperationContext, PathItemContext } from "../contexts";
import { convertAsyncSyncOperation } from "./convertAsyncSyncOperation";
import { convertHttpOperation } from "./convertHttpOperation";
import { convertStreamingOperation } from "./convertStreamingOperation";
import { convertWebhookOperation } from "./convertWebhookOperation";

export type ConvertedOperation =
    | ConvertedAsyncAndSyncOperation
    | ConvertedHttpOperation
    | ConvertedWebhookOperation
    | ConvertedStreamingOperation;

export interface ConvertedAsyncAndSyncOperation {
    type: "async";
    async: EndpointWithExample;
    sync: EndpointWithExample;
}

export interface ConvertedHttpOperation {
    type: "http";
    value: EndpointWithExample;
}

export interface ConvertedWebhookOperation {
    type: "webhook";
    value: WebhookWithExample;
}

export interface ConvertedStreamingOperation {
    type: "streaming";
    streaming: EndpointWithExample;
    nonStreaming: EndpointWithExample | undefined;
}

export function convertOperation({
    context,
    pathItemContext,
    operation,
    convertToWebhook
}: {
    context: AbstractOpenAPIV3ParserContext;
    pathItemContext: PathItemContext;
    operation: OpenAPIV3.OperationObject;
    convertToWebhook: boolean;
}): ConvertedOperation | undefined {
    const shouldIgnore = getExtension<boolean>(operation, FernOpenAPIExtension.IGNORE);
    if (shouldIgnore != null && shouldIgnore) {
        context.logger.info(
            `${pathItemContext.method.toUpperCase()} ${pathItemContext.path} is marked with x-fern-ignore. Skipping.`
        );
        return undefined;
    }

    const sdkMethodName = getSdkGroupAndMethod(operation, context);
    const pagination = getFernPaginationExtension(context.document, operation);

    const operationContext: OperationContext = {
        ...pathItemContext,
        sdkMethodName,
        baseBreadcrumbs: getBaseBreadcrumbs({
            operation,
            sdkMethodName,
            httpMethod: pathItemContext.method,
            path: pathItemContext.path
        }),
        operation,
        operationParameters: operation.parameters ?? [],
        pagination
    };

    if (convertToWebhook) {
        const webhook = convertWebhookOperation({
            context,
            operationContext,
            source: context.source
        });
        return webhook != null ? { type: "webhook", value: webhook } : undefined;
    }

    const streamingExtension = getFernStreamingExtension(operation);
    if (streamingExtension != null) {
        const streamingOperation = convertStreamingOperation({
            context,
            operationContext,
            streamingExtension
        });
        return streamingOperation != null
            ? {
                  type: "streaming",
                  streaming: streamingOperation.streaming,
                  nonStreaming: streamingOperation.nonStreaming
              }
            : undefined;
    }

    const asyncExtension = getFernAsyncExtension(operation);
    if (asyncExtension != null) {
        const asyncAndSync = convertAsyncSyncOperation({
            context,
            operationContext,
            asyncExtension,
            source: context.source
        });
        return {
            type: "async",
            async: asyncAndSync.async,
            sync: asyncAndSync.sync
        };
    }

    const convertedHttpOperation = convertHttpOperation({
        context,
        operationContext,
        streamFormat: undefined,
        source: context.source
    });
    return { type: "http", value: convertedHttpOperation };
}

function getSdkGroupAndMethod(
    operation: OpenAPIV3.OperationObject,
    context: AbstractOpenAPIV3ParserContext
): EndpointSdkName | undefined {
    const sdkMethodName = getExtension<string>(operation, FernOpenAPIExtension.SDK_METHOD_NAME);
    const sdkGroupName = getExtension(operation, FernOpenAPIExtension.SDK_GROUP_NAME) ?? [];
    if (sdkMethodName != null) {
        let groupName: SdkGroupName = typeof sdkGroupName === "string" ? [sdkGroupName] : sdkGroupName;
        groupName = context.resolveGroupName(groupName);
        return {
            groupName,
            methodName: sdkMethodName
        };
    }
    return undefined;
}

function getBaseBreadcrumbs({
    sdkMethodName,
    operation,
    httpMethod,
    path
}: {
    sdkMethodName?: EndpointSdkName;
    operation: OpenAPIV3.OperationObject;
    httpMethod: HttpMethod;
    path: string;
}): string[] {
    const baseBreadcrumbs: string[] = [];
    if (sdkMethodName != null) {
        if (sdkMethodName.groupName.length > 0) {
            const lastGroupName = sdkMethodName.groupName[sdkMethodName.groupName.length - 1];
            if (lastGroupName != null) {
                baseBreadcrumbs.push(typeof lastGroupName === "string" ? lastGroupName : lastGroupName.name);
            }
        }
        baseBreadcrumbs.push(sdkMethodName.methodName);
    } else if (operation.operationId != null) {
        baseBreadcrumbs.push(operation.operationId);
    } else {
        baseBreadcrumbs.push(camelCase(`${httpMethod}_${path.split("/").join("_")}`));
    }
    return baseBreadcrumbs;
}
