import { generatorsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
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
import { getExtension } from "../../../../getExtension.js";
import { getGeneratedTypeName } from "../../../../schema/utils/getSchemaName.js";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject.js";
import { sanitizeSecurityScopes } from "../../../../utils/sanitizeSecurityScopes.js";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext.js";
import { DummyOpenAPIV3ParserContext } from "../../DummyOpenAPIV3ParserContext.js";
import { OpenAPIExtension } from "../../extensions/extensions.js";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions.js";
import { getExamplesFromExtension } from "../../extensions/getExamplesFromExtension.js";
import { getFernAvailability } from "../../extensions/getFernAvailability.js";
import { getFernRetriesExtension } from "../../extensions/getFernRetriesExtension.js";
import { OperationContext } from "../contexts.js";
import { convertServer } from "../convertServer.js";
import { ConvertedParameters, convertParameters } from "../endpoint/convertParameters.js";
import { convertRequest, convertToSingleRequest } from "../endpoint/convertRequest.js";
import { convertResponse } from "../endpoint/convertResponse.js";

export function convertHttpOperation({
    operationContext,
    context,
    responseStatusCode,
    suffix,
    streamFormat,
    streamTerminator,
    source,
    streamRequestNameOverride
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    responseStatusCode?: number;
    suffix?: string;
    streamFormat: "sse" | "json" | undefined;
    streamTerminator?: string;
    source: Source;
    streamRequestNameOverride?: string;
}): EndpointWithExample[] {
    const { document, operation, path, method, baseBreadcrumbs, pathItem } = operationContext;

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
    const pathParams = [...path.matchAll(PATH_PARAM_REGEX)].map((match) => match[1]);

    switch (context.options.pathParameterOrder) {
        case generatorsYml.PathParameterOrder.SpecOrder:
            {
                // Check if any path parameters are missing from convertedParameters
                const missingPathParams = pathParams.filter(
                    (param) => !convertedParameters.pathParameters.some((p) => p.name === param)
                );

                // Add missing path parameters
                if (missingPathParams.length > 0) {
                    for (const param of missingPathParams) {
                        convertedParameters.pathParameters.push({
                            name: param ?? "",
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
                            description: undefined,
                            explode: undefined,
                            clientDefault: undefined
                        });
                    }
                }
            }
            break;
        case generatorsYml.PathParameterOrder.UrlOrder:
            {
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
                                description: undefined,
                                explode: undefined,
                                clientDefault: undefined
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
            }
            break;
        default:
            assertNever(context.options.pathParameterOrder);
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
        streamTerminator,
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
        requestNameOverride: streamRequestNameOverride ?? requestNameOverride ?? undefined,
        generatedRequestName: getDisambiguatedRequestName({
            baseBreadcrumbs,
            requestBreadcrumbs,
            isMultipleRequests,
            request,
            context
        }),
        request,
        response: convertedResponse.value,
        errors: convertedResponse.errors,
        servers:
            serverName != null
                ? [{ name: serverName, url: undefined, audiences: undefined }]
                : (operation.servers ?? pathItem.servers ?? []).map((server) =>
                      convertServer(server, { groupMultiApiEnvironments: context.options.groupMultiApiEnvironments })
                  ),
        description: operation.description,
        authed: isEndpointAuthed(operation, document),
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

function generateSecurity(operation: OpenAPIV3.OperationObject): EndpointSecurity | undefined {
    return sanitizeSecurityScopes(operation.security);
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

/**
 * Computes the generated request name, disambiguating when it would collide
 * with a top-level component schema. Without this, specs that use the common
 * pattern of `$ref`-ing `#/components/schemas/XRequest` from an operation
 * whose operationId-derived breadcrumbs also produce `XRequest` will emit
 * duplicate type declarations (TS2308, Java import collisions, Go redeclare).
 */
function getDisambiguatedRequestName({
    baseBreadcrumbs,
    requestBreadcrumbs,
    isMultipleRequests,
    request,
    context
}: {
    baseBreadcrumbs: string[];
    requestBreadcrumbs: string[];
    isMultipleRequests: boolean;
    request: RequestWithExample | undefined;
    context: AbstractOpenAPIV3ParserContext;
}): string {
    const nameBreadcrumbs = isMultipleRequests
        ? getDifferentiatedBreadcrumbs({ breadcrumbs: requestBreadcrumbs, request })
        : requestBreadcrumbs;
    const computedName = getGeneratedTypeName(nameBreadcrumbs, context.options.preserveSchemaIds);

    const componentSchemas = context.document.components?.schemas;
    if (componentSchemas == null) {
        return computedName;
    }

    // Check if any component schema would produce the same generated type name.
    const collidesWithSchema = Object.keys(componentSchemas).some(
        (schemaKey) => getGeneratedTypeName([schemaKey], context.options.preserveSchemaIds) === computedName
    );
    if (!collidesWithSchema) {
        return computedName;
    }

    // Replace "Request" breadcrumb with "Body" to produce a non-colliding name.
    const bodyBreadcrumbs = [...baseBreadcrumbs, "Body"];
    const bodyNameBreadcrumbs = isMultipleRequests
        ? getDifferentiatedBreadcrumbs({ breadcrumbs: bodyBreadcrumbs, request })
        : bodyBreadcrumbs;
    return getGeneratedTypeName(bodyNameBreadcrumbs, context.options.preserveSchemaIds);
}
