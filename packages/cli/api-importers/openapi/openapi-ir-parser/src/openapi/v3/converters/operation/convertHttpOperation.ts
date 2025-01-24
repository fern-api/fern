import { OpenAPIV3 } from "openapi-types";

import { EndpointWithExample, Source } from "@fern-api/openapi-ir";

import { getExtension } from "../../../../getExtension";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { DummyOpenAPIV3ParserContext } from "../../DummyOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../../extensions/extensions";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getExamplesFromExtension } from "../../extensions/getExamplesFromExtension";
import { getFernAvailability } from "../../extensions/getFernAvailability";
import { OperationContext } from "../contexts";
import { convertServer } from "../convertServer";
import { ConvertedParameters, convertParameters } from "../endpoint/convertParameters";
import { convertRequest } from "../endpoint/convertRequest";
import { convertResponse } from "../endpoint/convertResponse";

export function convertHttpOperation({
    operationContext,
    context,
    responseStatusCode,
    suffix,
    streamFormat,
    source
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    responseStatusCode?: number;
    suffix?: string;
    streamFormat: "sse" | "json" | undefined;
    source: Source;
}): EndpointWithExample {
    const { document, operation, path, method, baseBreadcrumbs, sdkMethodName } = operationContext;

    const idempotent = getExtension<boolean>(operation, FernOpenAPIExtension.IDEMPOTENT);
    const requestNameOverride = getExtension<string>(operation, [
        FernOpenAPIExtension.REQUEST_NAME_V1,
        FernOpenAPIExtension.REQUEST_NAME_V2
    ]);
    const requestBreadcrumbs = [...baseBreadcrumbs, "Request"];
    const convertedParameters = convertParameters({
        parameters: [...operationContext.pathItemParameters, ...operationContext.operationParameters],
        context,
        requestBreadcrumbs,
        path,
        httpMethod: method,
        source
    });
    let convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context: new DummyOpenAPIV3ParserContext({
                      document: context.document,
                      taskContext: context.taskContext,
                      options: context.options,
                      source: context.source,
                      namespace: context.namespace
                  }),
                  requestBreadcrumbs,
                  source,
                  namespace: context.namespace
              })
            : undefined;

    // if request has query params or headers and body is not an object, then use `Body`
    if (
        endpointHasNonRequestBodyParameters({ context, convertedParameters }) &&
        convertedRequest != null &&
        convertedRequest.type === "json" &&
        convertedRequest.schema.type !== "object" &&
        operation.requestBody != null
    ) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs, "Body"],
            source,
            namespace: context.namespace
        });
    } else if (operation.requestBody != null) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs],
            source,
            namespace: context.namespace
        });
    }

    const responseBreadcrumbs = [...baseBreadcrumbs, "Response"];

    const convertedResponse = convertResponse({
        operationContext,
        streamFormat,
        responses: operation.responses,
        context,
        responseBreadcrumbs,
        responseStatusCode,
        source
    });

    const availability = getFernAvailability(operation);
    const examples = getExamplesFromExtension(operationContext, operation, context);
    const serverName = getExtension<string>(operation, FernOpenAPIExtension.SERVER_NAME_V2);
    return {
        summary: operation.summary,
        internal: getExtension<boolean>(operation, OpenAPIExtension.INTERNAL),
        idempotent,
        audiences: getExtension<string[]>(operation, FernOpenAPIExtension.AUDIENCES) ?? [],
        operationId:
            operation.operationId != null && suffix != null
                ? operation.operationId + "_" + suffix
                : operation.operationId,
        tags: context.resolveTagsToTagIds(operation.tags),
        namespace: context.namespace,
        sdkName: sdkMethodName,
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestNameOverride: requestNameOverride ?? undefined,
        generatedRequestName: getGeneratedTypeName(requestBreadcrumbs, context.options.preserveSchemaIds),
        request: convertedRequest,
        response: convertedResponse.value,
        errors: convertedResponse.errors,
        server:
            serverName != null
                ? [{ name: serverName, url: undefined, audiences: undefined }]
                : (operation.servers ?? []).map((server) => convertServer(server)),
        description: operation.description,
        authed: isEndpointAuthed(operation, document),
        availability,
        method,
        path,
        examples,
        pagination: operationContext.pagination,
        source
    };
}

function isEndpointAuthed(operation: OpenAPIV3.OperationObject, document: OpenAPIV3.Document): boolean {
    if (operation.security != null) {
        return Object.keys(operation.security).length > 0;
    }
    if (document.security != null) {
        return Object.keys(document.security).length > 0;
    }
    return false;
}

function endpointHasNonRequestBodyParameters({
    context,
    convertedParameters
}: {
    context: AbstractOpenAPIV3ParserContext;
    convertedParameters: ConvertedParameters;
}): boolean {
    return (
        (context.options.inlinePathParameters && convertedParameters.pathParameters.length > 0) ||
        convertedParameters.queryParameters.length > 0 ||
        convertedParameters.headers.length > 0
    );
}
