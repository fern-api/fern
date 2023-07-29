import { Endpoint, EndpointSdkName, HttpMethod, Schema } from "@fern-fern/openapi-ir-model/ir";
import { camelCase } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../AbstractOpenAPIV3ParserContext";
import { DummyOpenAPIV3ParserContext } from "../DummyOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../extensions/extensions";
import { FernOpenAPIExtension } from "../extensions/fernExtensions";
import { getExtension } from "../extensions/getExtension";
import { getGeneratedTypeName } from "../utils/getSchemaName";
import { isReferenceObject } from "../utils/isReferenceObject";
import { convertServer } from "./convertServer";
import { convertParameters } from "./endpoint/convertParameters";
import { convertRequest } from "./endpoint/convertRequest";
import { convertResponse } from "./endpoint/convertResponse";

interface FernAsyncConfig {
    discriminant: {
        name: string;
        value: string;
    };
    "response-status-code": number;
}

export function convertPathItem(
    path: string,
    pathItemObject: OpenAPIV3.PathItemObject,
    document: OpenAPIV3.Document,
    context: AbstractOpenAPIV3ParserContext
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
    context: AbstractOpenAPIV3ParserContext;
}): Endpoint[] {
    const shouldIgnore = getExtension<boolean>(operation, FernOpenAPIExtension.IGNORE);
    if (shouldIgnore != null && shouldIgnore) {
        return [];
    }

    const endpoints: Endpoint[] = [];
    const sdkName = getSdkName({ operation });
    const parameters = [...(operation.parameters ?? []), ...(pathItemParameters ?? [])];

    const asyncConfig = getExtension<FernAsyncConfig>(operation, FernOpenAPIExtension.ASYNC_CONFIG);
    if (asyncConfig != null) {
        const headerToIgnore = asyncConfig.discriminant.name;
        const headerValue = asyncConfig.discriminant.value;
        const asyncResponseStatusCode = asyncConfig["response-status-code"];

        const parametersWithoutHeader = parameters.filter((parameter) => {
            const resolvedParameter = isReferenceObject(parameter)
                ? context.resolveParameterReference(parameter)
                : parameter;
            if (resolvedParameter.in === "header" && resolvedParameter.name === headerToIgnore) {
                return false;
            }
            return true;
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
            parameters: parametersWithoutHeader,
            document,
            context,
            path,
            httpMethod,
        });
        endpoints.push({
            ...synchronousEndpoint,
            path,
            method: httpMethod,
        });

        const asynchronousEndpoint = convertToEndpoint({
            sdkName,
            operation,
            parameters: parametersWithoutHeader,
            document,
            context,
            responseStatusCode: asyncResponseStatusCode,
            suffix: "async",
            path,
            httpMethod,
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
                parameters,
                document,
                context,
                path,
                httpMethod,
            }),
            path,
            method: httpMethod,
        });
    }
    return endpoints;
}

function getSdkName({ operation }: { operation: OpenAPIV3.OperationObject }): EndpointSdkName | undefined {
    const sdkMethodName = getExtension<string>(operation, FernOpenAPIExtension.SDK_METHOD_NAME);
    const sdkGroupName = getExtension<string | string[]>(operation, FernOpenAPIExtension.SDK_GROUP_NAME) ?? [];
    if (sdkMethodName != null) {
        return {
            groupName: typeof sdkGroupName === "string" ? [sdkGroupName] : sdkGroupName,
            methodName: sdkMethodName,
        };
    }
    return undefined;
}

function convertToEndpoint({
    sdkName,
    operation,
    parameters,
    document,
    context,
    responseStatusCode,
    suffix,
    path,
    httpMethod,
}: {
    sdkName?: EndpointSdkName;
    operation: OpenAPIV3.OperationObject;
    parameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[];
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
    responseStatusCode?: number;
    suffix?: string;
    path: string;
    httpMethod: HttpMethod;
}): Omit<Endpoint, "path" | "method"> {
    const baseBreadcrumbs: string[] = [];
    if (sdkName != null) {
        if (sdkName.groupName.length > 0) {
            baseBreadcrumbs.push(...sdkName.groupName);
        }
        baseBreadcrumbs.push(sdkName.methodName);
    } else if (operation.operationId != null) {
        baseBreadcrumbs.push(operation.operationId);
    } else {
        baseBreadcrumbs.push(camelCase(`${httpMethod}_${path.split("/").join("_")}`));
    }

    if (suffix != null) {
        baseBreadcrumbs.push(suffix);
    }

    const isStreaming = getExtension<boolean>(operation, FernOpenAPIExtension.STREAMING);
    const requestNameOverride = getExtension<string>(operation, [
        FernOpenAPIExtension.REQUEST_NAME_V1,
        FernOpenAPIExtension.REQUEST_NAME_V2,
    ]);
    const requestBreadcrumbs = [...baseBreadcrumbs, "Request"];

    const convertedParameters = convertParameters({
        parameters,
        context,
        requestBreadcrumbs,
        path,
        httpMethod,
    });
    let convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context: new DummyOpenAPIV3ParserContext({
                      document: context.document,
                      taskContext: context.taskContext,
                  }),
                  requestBreadcrumbs,
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
            requestBreadcrumbs: [...requestBreadcrumbs, "Body"],
        });
    } else if (operation.requestBody != null) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs],
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
        internal: getExtension<boolean>(operation, OpenAPIExtension.INTERNAL),
        audiences: getExtension<string[]>(operation, FernOpenAPIExtension.AUDIENCES) ?? [],
        operationId:
            operation.operationId != null && suffix != null
                ? operation.operationId + "_" + suffix
                : operation.operationId,
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
