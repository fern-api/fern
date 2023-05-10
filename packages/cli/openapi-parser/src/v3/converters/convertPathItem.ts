import { Endpoint, EndpointSdkName, HttpMethod, Schema } from "@fern-fern/openapi-ir-model/ir";
import { camelCase } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { X_FERN_ASYNC_CONFIG } from "../extensions";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { getGeneratedTypeName } from "../utils/getSchemaName";
import { isReferenceObject } from "../utils/isReferenceObject";
import { convertServer } from "./convertServer";
import { convertParameters } from "./endpoint/convertParameters";
import { convertRequest } from "./endpoint/convertRequest";
import { convertResponse } from "./endpoint/convertResponse";

export function convertPathItem(
    path: string,
    pathItemObject: OpenAPIV3.PathItemObject,
    document: OpenAPIV3.Document,
    context: OpenAPIV3ParserContext
): Endpoint[] {
    const endpoints: Endpoint[] = [];

    if (pathItemObject.get != null) {
        endpoints.push(
            ...convertSyncAndAsyncEndpoints({
                httpMethod: HttpMethod.Get,
                path,
                operation: pathItemObject.get,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.post != null) {
        endpoints.push(
            ...convertSyncAndAsyncEndpoints({
                httpMethod: HttpMethod.Post,
                path,
                operation: pathItemObject.post,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.put != null) {
        endpoints.push(
            ...convertSyncAndAsyncEndpoints({
                httpMethod: HttpMethod.Put,
                path,
                operation: pathItemObject.put,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.patch != null) {
        endpoints.push(
            ...convertSyncAndAsyncEndpoints({
                httpMethod: HttpMethod.Patch,
                path,
                operation: pathItemObject.patch,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.delete != null) {
        endpoints.push(
            ...convertSyncAndAsyncEndpoints({
                httpMethod: HttpMethod.Delete,
                path,
                operation: pathItemObject.delete,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    return endpoints;
}

function convertSyncAndAsyncEndpoints({
    path,
    httpMethod,
    operation,
    pathItemParameters,
    document,
    context,
}: {
    path: string;
    httpMethod: HttpMethod;
    operation: OpenAPIV3.OperationObject;
    pathItemParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] | undefined;
    document: OpenAPIV3.Document;
    context: OpenAPIV3ParserContext;
}): Endpoint[] {
    const endpoints: Endpoint[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkName = getSdkName({ operation, httpMethod, path });
    const asynConfig = (operation as any)[X_FERN_ASYNC_CONFIG] as Record<string, any> | undefined;
    if (asynConfig != null) {
        const headerToIgnore = asynConfig.discriminant.name as string;
        const headerValue = asynConfig.discriminant.value as string;
        const asyncResponseStatusCode = asynConfig["response-status-code"] as number;

        const pathItemParameterWithoutHeader = pathItemParameters?.filter((pathItemParameter) => {
            const resolvedParameter = isReferenceObject(pathItemParameter)
                ? context.resolveParameterReference(pathItemParameter)
                : pathItemParameter;
            return resolvedParameter.in !== "header" && resolvedParameter.name !== headerToIgnore;
        });

        const synchronousEndpoint = convertToEndpoint({
            sdkName,
            operation: {
                ...operation,
                responses: Object.fromEntries(
                    Object.entries(operation.responses).filter(([statusCode]) => {
                        return parseInt(statusCode) !== asyncResponseStatusCode;
                    })
                ),
            },
            pathItemParameters: pathItemParameterWithoutHeader,
            document,
            context,
        });
        endpoints.push({
            ...synchronousEndpoint,
            path,
            method: httpMethod,
        });

        const asynchronousEndpoint = convertToEndpoint({
            sdkName: {
                ...sdkName,
                methodName: camelCase(`${sdkName.methodName}_Async`),
            },
            operation,
            pathItemParameters: pathItemParameterWithoutHeader,
            document,
            context,
            responseStatusCode: asyncResponseStatusCode,
        });
        asynchronousEndpoint.headers.push({
            name: headerToIgnore,
            schema: Schema.literal({
                description: null,
                value: headerValue,
            }),
            description: undefined,
        });
        endpoints.push({
            ...asynchronousEndpoint,
            path,
            method: httpMethod,
        });
    } else {
        endpoints.push({
            ...convertToEndpoint({
                sdkName,
                operation,
                pathItemParameters,
                document,
                context,
            }),
            path,
            method: httpMethod,
        });
    }
    return endpoints;
}

function getSdkName({
    operation,
    httpMethod,
    path,
}: {
    operation: OpenAPIV3.OperationObject;
    path: string;
    httpMethod: HttpMethod;
}): EndpointSdkName {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkMethodName = (operation as any)["x-fern-sdk-method-name"] as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkGroupName = (operation as any)["x-fern-sdk-group-name"] as string | undefined;
    if (sdkMethodName != null) {
        return {
            groupName: sdkGroupName,
            methodName: sdkMethodName,
        };
    }

    if (operation.operationId == null) {
        throw new Error(`${httpMethod} ${path} must specify either operationId or x-fern-sdk-method-name`);
    }
    return {
        groupName: operation.tags?.[0] ?? undefined,
        methodName: operation.operationId,
    };
}

function convertToEndpoint({
    sdkName,
    operation,
    pathItemParameters,
    document,
    context,
    responseStatusCode,
}: {
    sdkName: EndpointSdkName;
    operation: OpenAPIV3.OperationObject;
    pathItemParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] | undefined;
    document: OpenAPIV3.Document;
    context: OpenAPIV3ParserContext;
    responseStatusCode?: number;
}): Omit<Endpoint, "path" | "method"> {
    const baseBreadcrumbs: string[] = [];
    if (sdkName.groupName != null) {
        baseBreadcrumbs.push(sdkName.groupName);
    }
    baseBreadcrumbs.push(sdkName.methodName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStreaming = (operation as any)["x-fern-streaming"] as boolean | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestNameOverride = (operation as any)["x-request-name"] as string | undefined;
    const requestBreadcrumbs = [...baseBreadcrumbs, "Request"];

    const endpointParameters = [...(operation.parameters ?? []), ...(pathItemParameters ?? [])];
    const convertedParameters = convertParameters(endpointParameters, context, requestBreadcrumbs);
    let convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context,
                  requestBreadcrumbs,
              })
            : undefined;

    // if request has query params and body is not an object, then use `Body`
    if (
        convertedParameters.queryParameters.length > 0 &&
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
        });
    }

    const responseBreadcrumbs = [...baseBreadcrumbs, "Response"];
    const convertedResponse = convertResponse({
        responses: operation.responses,
        context,
        responseBreadcrumbs,
        responseStatusCode,
    });
    return {
        summary: operation.summary,
        operationId: operation.operationId,
        tags: operation.tags ?? [],
        sdkName,
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestNameOverride: requestNameOverride ?? undefined,
        generatedRequestName: getGeneratedTypeName(requestBreadcrumbs),
        request: convertedRequest,
        response: convertedResponse.value,
        errorStatusCode: convertedResponse.errorStatusCodes,
        server: (operation.servers ?? []).map((server) => convertServer(server)),
        description: operation.description,
        responseIsStreaming: isStreaming ?? false,
        authed: isEndpointAuthed(operation, document),
    };
}

function isEndpointAuthed(operation: OpenAPIV3.OperationObject, document: OpenAPIV3.Document): boolean {
    if (operation.security != null) {
        return Object.keys(operation.security).length >= 0;
    }
    if (document.security != null) {
        return Object.keys(document.security).length >= 0;
    }
    return false;
}
