import { EndpointWithExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
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
import { convertParameters } from "../endpoint/convertParameters";
import { convertRequest } from "../endpoint/convertRequest";
import { convertResponse } from "../endpoint/convertResponse";

export function convertHttpOperation({
    operationContext,
    context,
    responseStatusCode,
    suffix,
    streamFormat
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    responseStatusCode?: number;
    suffix?: string;
    streamFormat: "sse" | "json" | undefined;
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
        httpMethod: method
    });
    let convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context: new DummyOpenAPIV3ParserContext({
                      document: context.document,
                      taskContext: context.taskContext,
                      options: context.options
                  }),
                  requestBreadcrumbs
              })
            : undefined;

    // if request has query params or headers and body is not an object, then use `Body`
    if (
        (convertedParameters.queryParameters.length > 0 || convertedParameters.headers.length > 0) &&
        convertedRequest != null &&
        convertedRequest.type === "json" &&
        convertedRequest.schema.type !== "object" &&
        operation.requestBody != null
    ) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs, "Body"]
        });
    } else if (operation.requestBody != null) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs]
        });
    }

    const responseBreadcrumbs = [...baseBreadcrumbs, "Response"];

    const convertedResponse = convertResponse({
        operationContext,
        streamFormat,
        responses: operation.responses,
        context,
        responseBreadcrumbs,
        responseStatusCode
    });

    const availability = getFernAvailability(operation);
    const examples = getExamplesFromExtension(operationContext, operation, context);

    return {
        summary: operation.summary,
        internal: getExtension<boolean>(operation, OpenAPIExtension.INTERNAL),
        idempotent,
        audiences: getExtension<string[]>(operation, FernOpenAPIExtension.AUDIENCES) ?? [],
        operationId:
            operation.operationId != null && suffix != null
                ? operation.operationId + "_" + suffix
                : operation.operationId,
        tags: operation.tags ?? [],
        sdkName: sdkMethodName,
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestNameOverride: requestNameOverride ?? undefined,
        generatedRequestName: getGeneratedTypeName(requestBreadcrumbs),
        request: convertedRequest,
        response: convertedResponse.value,
        errors: convertedResponse.errors,
        server: (operation.servers ?? []).map((server) => convertServer(server)),
        description: operation.description,
        authed: isEndpointAuthed(operation, document),
        availability,
        method,
        path,
        examples,
        pagination: operationContext.pagination
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
