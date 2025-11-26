import {
    EndpointSdkName,
    EndpointSecurity,
    EndpointWithExample,
    PathParameterWithExample,
    PrimitiveSchemaValueWithExample,
    RequestWithExample,
    SchemaWithExample,
    Source
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { DummyOpenAPIV3ParserContext } from "../../DummyOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../../extensions/extensions";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getExamplesFromExtension } from "../../extensions/getExamplesFromExtension";
import { getFernAvailability } from "../../extensions/getFernAvailability";
import { getFernRetriesExtension } from "../../extensions/getFernRetriesExtension";
import { OperationContext } from "../contexts";
import { convertServer } from "../convertServer";
import { ConvertedParameters, convertParameters } from "../endpoint/convertParameters";
import { convertRequest, convertToSingleRequest } from "../endpoint/convertRequest";
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
}): EndpointWithExample[] {
    const { document, operation, path, method, baseBreadcrumbs } = operationContext;

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

    // Parse path parameters from URL to get their order
    const PATH_PARAM_REGEX = /{([^}]+)}/g;
    const paramNamesInUrlOrder = [...path.matchAll(PATH_PARAM_REGEX)]
        .map((match) => match[1])
        .filter((paramName): paramName is string => paramName !== undefined);

    // Reorder path parameters to match URL order
    if (paramNamesInUrlOrder.length > 0) {
        const urlParams = new Map(convertedParameters.pathParameters.map((param) => [param.name, param]));

        // If there's a path parameter listed only in the URL, add it to the list
        const reorderedPathParameters: PathParameterWithExample[] = [];
        const usedParams = new Set<string>();

        for (const paramName of paramNamesInUrlOrder) {
            const urlParam = urlParams.get(paramName);
            usedParams.add(paramName);

            if (urlParam) {
                reorderedPathParameters.push(urlParam);
            } else {
                reorderedPathParameters.push({
                    name: paramName,
                    variableReference: undefined,
                    parameterNameOverride: undefined,
                    availability: undefined,
                    source,
                    schema: SchemaWithExample.primitive({
                        schema: PrimitiveSchemaValueWithExample.string({
                            default: undefined,
                            example: undefined,
                            format: undefined,
                            maxLength: undefined,
                            minLength: undefined,
                            pattern: undefined
                        }),
                        description: undefined,
                        generatedName: "",
                        nameOverride: undefined,
                        namespace: undefined,
                        groupName: undefined,
                        availability: undefined,
                        title: undefined
                    }),
                    description: undefined
                });
            }
        }

        // Add any remaining path parameters that don't appear in the URL at the end
        for (const param of convertedParameters.pathParameters) {
            if (!usedParams.has(param.name)) {
                reorderedPathParameters.push(param);
            }
        }

        convertedParameters.pathParameters = reorderedPathParameters;
    }

    let convertedRequests = (() => {
        if (operationContext.method === "GET") {
            // If the method is GET, the request should be explicitly undefined
            return [undefined];
        }
        if (!operation.requestBody) {
            return [undefined];
        }
        const resolvedRequestBody = isReferenceObject(operation.requestBody)
            ? context.resolveRequestBodyReference(operation.requestBody)
            : operation.requestBody;

        const allRequestsHaveSdkMethodNames = Object.values(resolvedRequestBody.content).every(
            (mediaTypeObject) => getRequestSdkMethodName({ mediaTypeObject }) != null
        );

        const requests: (RequestWithExample | undefined)[] = [];
        if (allRequestsHaveSdkMethodNames) {
            requests.push(
                ...Object.entries(resolvedRequestBody.content)
                    .map(([mediaType, mediaTypeObject]) => {
                        let convertedRequest = convertRequest({
                            mediaType,
                            mediaTypeObject,
                            description: resolvedRequestBody.description,
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
                        });

                        // if request has query params or headers and body is not an object, then use `Body`
                        if (
                            endpointHasNonRequestBodyParameters({ context, convertedParameters }) &&
                            convertedRequest != null &&
                            (convertedRequest.type === "json" || convertedRequest.type === "formUrlEncoded") &&
                            convertedRequest.schema.type !== "object" &&
                            operation.requestBody != null
                        ) {
                            convertedRequest = convertRequest({
                                mediaType,
                                mediaTypeObject,
                                description: resolvedRequestBody.description,
                                document,
                                context,
                                requestBreadcrumbs: [...requestBreadcrumbs, "Body"],
                                source,
                                namespace: context.namespace
                            });
                        } else if (operation.requestBody != null) {
                            convertedRequest = convertRequest({
                                mediaType,
                                mediaTypeObject,
                                description: resolvedRequestBody.description,
                                document,
                                context,
                                requestBreadcrumbs: [...requestBreadcrumbs],
                                source,
                                namespace: context.namespace
                            });
                        }

                        return convertedRequest;
                    })
                    .filter((request) => request != null)
            );
            if (requests.length === 0) {
                return [undefined];
            }
            return requests;
        } else {
            let convertedRequest = convertToSingleRequest({
                content: resolvedRequestBody.content,
                description: resolvedRequestBody.description,
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
            });

            // if request has query params or headers and body is not an object, then use `Body`
            if (
                endpointHasNonRequestBodyParameters({ context, convertedParameters }) &&
                convertedRequest != null &&
                (convertedRequest.type === "json" || convertedRequest.type === "formUrlEncoded") &&
                convertedRequest.schema.type !== "object" &&
                operation.requestBody != null
            ) {
                convertedRequest = convertToSingleRequest({
                    content: resolvedRequestBody.content,
                    description: resolvedRequestBody.description,
                    document,
                    context,
                    requestBreadcrumbs: [...requestBreadcrumbs, "Body"],
                    source,
                    namespace: context.namespace
                });
            } else if (operation.requestBody != null) {
                convertedRequest = convertToSingleRequest({
                    content: resolvedRequestBody.content,
                    description: resolvedRequestBody.description,
                    document,
                    context,
                    requestBreadcrumbs: [...requestBreadcrumbs],
                    source,
                    namespace: context.namespace
                });
            }

            return [convertedRequest];
        }
    })();
    const isMultipleRequests = convertedRequests.length > 1;

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

    const retries = getFernRetriesExtension(operation);
    const availability = getFernAvailability(operation);
    const examples = getExamplesFromExtension(operationContext, operation, context);
    const serverName = getExtension<string>(operation, FernOpenAPIExtension.SERVER_NAME_V2);
    return convertedRequests.map((request) => ({
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
        sdkName: createOperationSdkMethodName({ operationContext, request }),
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestNameOverride: requestNameOverride ?? undefined,
        generatedRequestName: getGeneratedTypeName(
            isMultipleRequests
                ? getDifferentiatedBreadcrumbs({ breadcrumbs: requestBreadcrumbs, request })
                : requestBreadcrumbs,
            context.options.preserveSchemaIds
        ),
        request,
        response: convertedResponse.value,
        errors: convertedResponse.errors,
        servers:
            serverName != null
                ? [{ name: serverName, url: undefined, audiences: undefined }]
                : (operation.servers ?? []).map((server) =>
                      convertServer(server, { groupMultiApiEnvironments: context.options.groupMultiApiEnvironments })
                  ),
        description: operation.description,
        authed: isEndpointAuthed({ operation, document, context }),
        security: generateSecurity(operation),
        availability,
        method,
        path,
        examples,
        pagination: operationContext.pagination,
        source,
        retries
    }));
}

// Differentiates breadcrumbs using the media type; e.g.,
// XYZRequest would become XYZRequestJson or XYZRequestOctetStream.
function getDifferentiatedBreadcrumbs({
    breadcrumbs,
    request
}: {
    breadcrumbs: string[];
    request: RequestWithExample | undefined;
}): string[] {
    return request ? [...breadcrumbs, request.type] : breadcrumbs;
}

function getRequestSdkMethodName({
    mediaTypeObject
}: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
}): string | undefined {
    return getExtension<string>(mediaTypeObject, FernOpenAPIExtension.SDK_METHOD_NAME);
}

function createOperationSdkMethodName({
    operationContext,
    request
}: {
    operationContext: OperationContext;
    request: RequestWithExample | undefined;
}): EndpointSdkName | undefined {
    if (!request) {
        return operationContext.sdkMethodName;
    }
    if (!request.sdkMethodName) {
        return operationContext.sdkMethodName;
    }
    if (operationContext.sdkMethodName) {
        return {
            groupName: [...operationContext.sdkMethodName.groupName],
            methodName: request.sdkMethodName ?? operationContext.sdkMethodName.methodName
        };
    }
    return {
        groupName: [],
        methodName: request.sdkMethodName
    };
}

function generateSecurity(operation: OpenAPIV3.OperationObject): EndpointSecurity {
    return operation.security ?? [];
}

function isEndpointAuthed({
    operation,
    document,
    context
}: {
    operation: OpenAPIV3.OperationObject;
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
}): boolean {
    if (operation.security != null) {
        return Object.keys(operation.security).length > 0;
    }
    if (document.security != null) {
        return Object.keys(document.security).length > 0;
    }
    return context.options.authDefaultsToTrue;
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
