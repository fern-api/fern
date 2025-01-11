import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { MediaType, assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Endpoint, EndpointExample, Namespace, Request, Schema, SchemaId } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { State } from "./State";
import { buildEndpointExample } from "./buildEndpointExample";
import { ERROR_DECLARATIONS_FILENAME, EXTERNAL_AUDIENCE } from "./buildFernDefinition";
import { buildHeader } from "./buildHeader";
import { buildPathParameter } from "./buildPathParameter";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { convertAvailability } from "./utils/convertAvailability";
import { convertFullExample } from "./utils/convertFullExample";
import { resolveLocationWithNamespace } from "./utils/convertSdkGroupName";
import { convertToHttpMethod } from "./utils/convertToHttpMethod";
import { convertToSourceSchema } from "./utils/convertToSourceSchema";
import { getEndpointNamespace } from "./utils/getNamespaceFromGroup";
import { getDocsFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";
import { isWriteMethod } from "./utils/isWriteMethod";

export interface ConvertedEndpoint {
    value: RawSchemas.HttpEndpointSchema;
    schemaIdsToExclude: string[];
}

export function buildEndpoint({
    endpoint,
    declarationFile,
    context
}: {
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
    endpoint: Endpoint;
}): ConvertedEndpoint {
    const { nonRequestReferencedSchemas } = context.ir;

    let schemaIdsToExclude: string[] = [];

    const names = new Set<string>();

    let path = endpoint.path;

    const maybeEndpointNamespace = getEndpointNamespace(endpoint.sdkName, endpoint.namespace);

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    for (const pathParameter of endpoint.pathParameters) {
        if (pathParameter.parameterNameOverride) {
            path = path.replace(pathParameter.name, pathParameter.parameterNameOverride);
        }
        pathParameters[pathParameter.parameterNameOverride ?? pathParameter.name] = buildPathParameter({
            pathParameter,
            context,
            fileContainingReference: declarationFile,
            namespace: maybeEndpointNamespace
        });
        names.add(pathParameter.name);
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    for (const queryParameter of endpoint.queryParameters) {
        const convertedQueryParameter = buildQueryParameter({
            queryParameter,
            context,
            fileContainingReference: declarationFile,
            namespace: maybeEndpointNamespace
        });
        if (convertedQueryParameter == null) {
            // TODO(dsinghvi): HACKHACK we are just excluding certain query params from the SDK
            continue;
        }
        queryParameters[queryParameter.name] = convertedQueryParameter;
        names.add(queryParameter.name);
    }

    let pagination: RawSchemas.PaginationSchema | undefined = undefined;
    if (endpoint.pagination != null) {
        if (endpoint.pagination.type === "cursor") {
            pagination = {
                cursor: endpoint.pagination.cursor,
                next_cursor: endpoint.pagination.nextCursor,
                results: endpoint.pagination.results
            };
        } else {
            pagination = {
                offset: endpoint.pagination.offset,
                step: endpoint.pagination.step,
                results: endpoint.pagination.results,
                "has-next-page": endpoint.pagination.hasNextPage
            };
        }
    }

    const convertedEndpoint: RawSchemas.HttpEndpointSchema = {
        path,
        method: convertToHttpMethod(endpoint.method),
        auth: endpoint.authed,
        docs: endpoint.description ?? undefined,
        pagination,
        source: endpoint.source != null ? convertToSourceSchema(endpoint.source) : undefined
    };

    if (
        !endpointRequestSupportsInlinedPathParameters({ context, request: endpoint.request }) &&
        Object.keys(pathParameters).length > 0
    ) {
        convertedEndpoint["path-parameters"] = pathParameters;
    }

    if (endpoint.summary != null) {
        convertedEndpoint["display-name"] = endpoint.summary;
    }

    const headers: Record<string, RawSchemas.HttpHeaderSchema> = {};
    const globalHeaderNames = context.builder.getGlobalHeaderNames();
    const endpointSpecificHeaders = endpoint.headers.filter((header) => {
        return !globalHeaderNames.has(header.name);
    });
    for (const header of endpointSpecificHeaders) {
        const headerSchema = buildHeader({
            header,
            context,
            fileContainingReference: declarationFile,
            namespace: maybeEndpointNamespace
        });
        headers[header.name] = headerSchema;
        names.add(typeof headerSchema === "string" ? header.name : (headerSchema.name ?? header.name));
    }

    if (endpoint.request != null) {
        context.setInState(State.Request);
        const convertedRequest = getRequest({
            endpoint,
            context,
            declarationFile,
            request: endpoint.request,
            generatedRequestName: endpoint.generatedRequestName,
            requestNameOverride: endpoint.requestNameOverride ?? undefined,
            pathParameters:
                context.inlinePathParameters && Object.keys(pathParameters).length > 0 ? pathParameters : undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
            nonRequestReferencedSchemas: Array.from(nonRequestReferencedSchemas),
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            usedNames: names,
            namespace: maybeEndpointNamespace
        });
        convertedEndpoint.request = convertedRequest.value;
        schemaIdsToExclude = [...schemaIdsToExclude, ...(convertedRequest.schemaIdsToExclude ?? [])];
        context.unsetInState(State.Request);
    } else {
        const hasPathParams = context.inlinePathParameters && Object.keys(pathParameters).length > 0;
        const hasQueryParams = Object.keys(queryParameters).length > 0;
        const hasHeaders = Object.keys(headers).length > 0;

        const convertedRequest: RawSchemas.HttpRequestSchema = {};

        if (hasPathParams || hasQueryParams || hasHeaders) {
            convertedRequest.name = endpoint.requestNameOverride ?? endpoint.generatedRequestName;
        }
        if (hasPathParams) {
            convertedRequest["path-parameters"] = pathParameters;
        }
        if (hasQueryParams) {
            convertedRequest["query-parameters"] = queryParameters;
        }
        if (hasHeaders) {
            convertedRequest.headers = headers;
        }

        if (Object.keys(convertedRequest).length > 0) {
            convertedEndpoint.request = convertedRequest;
        }
    }

    if (endpoint.response != null) {
        endpoint.response._visit({
            json: (jsonResponse) => {
                const responseTypeReference = buildTypeReference({
                    schema: jsonResponse.schema,
                    context,
                    fileContainingReference: declarationFile,
                    namespace: maybeEndpointNamespace,
                    declarationDepth: 0
                });
                convertedEndpoint.response = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference)
                };
                if (jsonResponse.responseProperty != null) {
                    convertedEndpoint.response.property = jsonResponse.responseProperty;
                }
            },
            streamingJson: (jsonResponse) => {
                const responseTypeReference = buildTypeReference({
                    schema: jsonResponse.schema,
                    context,
                    fileContainingReference: declarationFile,
                    namespace: maybeEndpointNamespace,
                    declarationDepth: 0
                });
                convertedEndpoint["response-stream"] = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference),
                    format: "json"
                };
            },
            streamingSse: (jsonResponse) => {
                const responseTypeReference = buildTypeReference({
                    schema: jsonResponse.schema,
                    context,
                    fileContainingReference: declarationFile,
                    namespace: maybeEndpointNamespace,
                    declarationDepth: 0
                });
                convertedEndpoint["response-stream"] = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference),
                    format: "sse"
                };
            },
            file: (fileResponse) => {
                convertedEndpoint.response = {
                    docs: fileResponse.description ?? undefined,
                    type: "file"
                };
            },
            streamingText: (textResponse) => {
                convertedEndpoint["response-stream"] = {
                    docs: textResponse.description ?? undefined,
                    type: "text"
                };
            },
            text: (textResponse) => {
                convertedEndpoint.response = {
                    docs: textResponse.description ?? undefined,
                    type: "text"
                };
            },
            _other: () => {
                throw new Error("Unrecognized Response type: " + endpoint.response?.type);
            }
        });
    }

    if (context.builder.getEnvironmentType() === "multi") {
        const defaultServer = context.getDefaultServerName();
        const serverOverride = endpoint.server[0];
        if (serverOverride == null) {
            if (defaultServer != null) {
                convertedEndpoint.url = defaultServer;
            }
        } else {
            convertedEndpoint.url = serverOverride.name ?? undefined;
        }
    }

    if (endpoint.idempotent) {
        convertedEndpoint.idempotent = true;
    }

    if (endpoint.availability != null) {
        convertedEndpoint.availability = convertAvailability(endpoint.availability);
    }

    Object.entries(endpoint.errors).forEach(([statusCode, httpError]) => {
        let errorName = httpError.generatedName;
        const fileContainingReference = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);
        if (context.builder.enableUniqueErrorsPerEndpoint) {
            errorName = `${endpoint.generatedRequestName}${httpError.generatedName}`;
            if (httpError.schema != null) {
                if (httpError.schema.type !== "reference" && httpError.schema.type !== "oneOf") {
                    httpError.schema.generatedName = `${endpoint.generatedRequestName}${httpError.schema.generatedName}`;
                } else if (httpError.schema.type === "oneOf") {
                    httpError.schema.value.generatedName = `${endpoint.generatedRequestName}${httpError.schema.value.generatedName}`;
                }
            }
            // fileContainingReference = declarationFile;
        }

        const errorDeclaration: RawSchemas.ErrorDeclarationSchema = {
            "status-code": parseInt(statusCode)
        };

        const errorDeclarationFile = resolveLocationWithNamespace({
            location: ERROR_DECLARATIONS_FILENAME,
            namespaceOverride: maybeEndpointNamespace
        });

        if (httpError.schema != null) {
            const typeReference = buildTypeReference({
                schema: httpError.schema,
                context,
                fileContainingReference: errorDeclarationFile,
                declarationFile: errorDeclarationFile,
                namespace: maybeEndpointNamespace,
                declarationDepth: 0
            });
            errorDeclaration.type = getTypeFromTypeReference(typeReference);
            errorDeclaration.docs = httpError.description;
        }

        context.builder.addError(errorDeclarationFile, {
            name: errorName,
            schema: context.isErrorUnknownSchema(parseInt(statusCode))
                ? { ...errorDeclaration, type: "unknown" }
                : errorDeclaration
        });

        if (convertedEndpoint.errors == null) {
            convertedEndpoint.errors = [];
        }
        const prefix = context.builder.addImport({
            file: declarationFile,
            fileToImport: errorDeclarationFile
        });
        convertedEndpoint.errors.push(prefix != null ? `${prefix}.${errorName}` : errorName);

        const errorTypeReference = errorDeclaration.type;
        if (errorTypeReference != null) {
            httpError.examples?.forEach((example) => {
                const convertedExample: RawSchemas.ExampleTypeSchema = {
                    value: convertFullExample(example.example),
                    name: example.name,
                    docs: example.description
                };

                context.builder.addErrorExample(errorDeclarationFile, {
                    name: errorName,
                    example: convertedExample
                });
            });
        }
    });

    if (endpoint.examples.length > 0) {
        convertedEndpoint.examples = convertEndpointExamples({
            endpointExamples: endpoint.examples,
            context
        });
    }

    // if any internal endpoints exist, then set the audience to external if this endpoint is not internal
    if (context.ir.hasEndpointsMarkedInternal && (endpoint.internal == null || !endpoint.internal)) {
        convertedEndpoint.audiences = [EXTERNAL_AUDIENCE, ...endpoint.audiences];
    } else if (endpoint.audiences.length > 0) {
        convertedEndpoint.audiences = endpoint.audiences;
    }

    return {
        value: convertedEndpoint,
        schemaIdsToExclude
    };
}

function convertEndpointExamples({
    endpointExamples,
    context
}: {
    endpointExamples: EndpointExample[];
    context: OpenApiIrConverterContext;
}): RawSchemas.ExampleEndpointCallSchema[] {
    return endpointExamples.map((endpointExample) => {
        try {
            return buildEndpointExample({ endpointExample, context });
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Error building endpoint example: ${e}`);
            throw e;
        }
    });
}

interface ConvertedRequest {
    value: RawSchemas.HttpRequestSchema;
    schemaIdsToExclude?: string[];
}

function getRequest({
    endpoint,
    declarationFile,
    context,
    request,
    requestNameOverride,
    generatedRequestName,
    pathParameters,
    queryParameters,
    nonRequestReferencedSchemas,
    headers,
    usedNames,
    namespace
}: {
    endpoint: Endpoint;
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    request: Request;
    requestNameOverride?: string;
    generatedRequestName: string;
    pathParameters?: Record<string, RawSchemas.HttpPathParameterSchema>;
    queryParameters?: Record<string, RawSchemas.HttpQueryParameterSchema>;
    nonRequestReferencedSchemas: SchemaId[];
    headers?: Record<string, RawSchemas.HttpHeaderSchema>;
    usedNames: Set<string>;
    namespace: string | undefined;
}): ConvertedRequest {
    if (request.type === "json") {
        const maybeSchemaId = request.schema.type === "reference" ? request.schema.schema : undefined;
        const resolvedSchema =
            request.schema.type === "reference" ? context.getSchema(request.schema.schema, namespace) : request.schema;
        // the request body is referenced if it is not an object or if other parts of the spec
        // refer to the same type
        if (
            resolvedSchema?.type !== "object" ||
            (maybeSchemaId != null && nonRequestReferencedSchemas.includes(maybeSchemaId))
        ) {
            const requestTypeReference = buildTypeReference({
                schema: request.schema,
                fileContainingReference: declarationFile,
                context,
                namespace,
                declarationDepth: 0
            });
            const convertedRequest: ConvertedRequest = {
                schemaIdsToExclude: [],
                value: {
                    body: requestTypeReference
                }
            };

            const hasPathParams = Object.keys(pathParameters ?? {}).length > 0;
            const hasQueryParams = Object.keys(queryParameters ?? {}).length > 0;
            const hasHeaders = Object.keys(headers ?? {}).length > 0;

            if (hasPathParams) {
                convertedRequest.value["path-parameters"] = pathParameters;
            }
            if (hasQueryParams) {
                convertedRequest.value["query-parameters"] = queryParameters;
            }
            if (hasHeaders) {
                convertedRequest.value.headers = headers;
            }
            if (hasPathParams || hasQueryParams || hasHeaders) {
                convertedRequest.value.name = requestNameOverride ?? generatedRequestName;
            }

            if (request.contentType != null) {
                convertedRequest.value["content-type"] = request.contentType;
            }

            if (request.description != null) {
                convertedRequest.value.docs = request.description;
            }

            return convertedRequest;
        }
        const properties = Object.fromEntries(
            resolvedSchema.properties
                .filter((property) => {
                    if (property.readonly == null) {
                        return true;
                    }
                    const writeEndpoint = isWriteMethod(endpoint.method);
                    if (writeEndpoint && property.readonly) {
                        return false;
                    }
                    return true;
                })
                .map((property) => {
                    const propertyTypeReference = buildTypeReference({
                        schema: property.schema,
                        fileContainingReference: declarationFile,
                        context,
                        namespace,
                        declarationDepth: 1 // 1 level deep for request body properties
                    });

                    // TODO: clean up conditional logic
                    const name = property.nameOverride ?? property.key;
                    const availability = convertAvailability(property.availability);
                    if (!usedNames.has(name) && property.audiences.length <= 0) {
                        usedNames.add(name);
                        if (property.nameOverride != null) {
                            return [
                                property.key,
                                {
                                    type: getTypeFromTypeReference(propertyTypeReference),
                                    docs: getDocsFromTypeReference(propertyTypeReference),
                                    name: property.nameOverride,
                                    availability
                                }
                            ];
                        }
                        return [
                            property.key,
                            availability
                                ? {
                                      ...(typeof propertyTypeReference === "string"
                                          ? { type: propertyTypeReference }
                                          : propertyTypeReference),
                                      availability
                                  }
                                : propertyTypeReference
                        ];
                    }

                    const typeReference: RawSchemas.ObjectPropertySchema = {
                        type: getTypeFromTypeReference(propertyTypeReference),
                        docs: getDocsFromTypeReference(propertyTypeReference)
                    };

                    if (usedNames.has(name)) {
                        typeReference.name = property.generatedName;
                    }

                    if (property.audiences.length > 0) {
                        typeReference.audiences = property.audiences;
                    }

                    if (availability != null) {
                        typeReference.availability = availability;
                    }

                    usedNames.add(name);
                    return [property.key, typeReference];
                })
        );
        const extendedSchemas: string[] = resolvedSchema.allOf.map((referencedSchema) => {
            const allOfTypeReference = buildTypeReference({
                schema: Schema.reference(referencedSchema),
                fileContainingReference: declarationFile,
                context,
                namespace,
                declarationDepth: 0
            });
            return getTypeFromTypeReference(allOfTypeReference);
        });
        const requestBodySchema: RawSchemas.HttpRequestBodySchema = {
            properties
        };
        if (extendedSchemas.length > 0) {
            requestBodySchema.extends = extendedSchemas;
        }
        if (request.additionalProperties) {
            requestBodySchema["extra-properties"] = true;
        }

        const convertedRequestValue: RawSchemas.HttpRequestSchema = {
            name: requestNameOverride ?? resolvedSchema.nameOverride ?? resolvedSchema.generatedName,
            "path-parameters": pathParameters,
            "query-parameters": queryParameters,
            headers,
            body: requestBodySchema
        };
        if (request.contentType != null) {
            convertedRequestValue["content-type"] = request.contentType;
        }
        if (request.description != null) {
            convertedRequestValue.docs = request.description;
        }
        return {
            schemaIdsToExclude: maybeSchemaId != null ? [maybeSchemaId] : [],
            value: convertedRequestValue
        };
    } else if (request.type === "octetStream") {
        return {
            schemaIdsToExclude: [],
            value: {
                body: "bytes",
                "content-type": MediaType.APPLICATION_OCTET_STREAM,
                ...(request.description ? { docs: request.description } : {})
            }
        };
    } else if (request.type === "multipart") {
        // multipart
        const properties = Object.fromEntries(
            request.properties.map((property) => {
                if (property.schema.type === "file") {
                    let fileType = property.schema.isArray ? "list<file>" : "file";
                    fileType = property.schema.isOptional ? `optional<${fileType}>` : fileType;
                    if (property.description != null || property.contentType != null) {
                        const propertyTypeReference: RawSchemas.HttpInlineRequestBodyPropertySchema = {
                            type: fileType
                        };
                        if (property.description != null) {
                            propertyTypeReference.docs = property.description;
                        }
                        if (property.contentType != null) {
                            const contentType = property.contentType.split(",")[0];
                            propertyTypeReference["content-type"] = contentType;
                        }
                        return [property.key, propertyTypeReference];
                    }
                    return [property.key, fileType];
                } else {
                    let propertyTypeReference: RawSchemas.HttpInlineRequestBodyPropertySchema = buildTypeReference({
                        schema: property.schema.value,
                        fileContainingReference: declarationFile,
                        context,
                        namespace,
                        declarationDepth: 1 // 1 level deep for request body properties
                    });
                    if (property.contentType != null) {
                        if (typeof propertyTypeReference === "string") {
                            propertyTypeReference = {
                                type: propertyTypeReference,
                                "content-type": property.contentType
                            };
                        } else {
                            propertyTypeReference["content-type"] = property.contentType;
                        }
                    }
                    return [property.key, propertyTypeReference];
                }
            })
        );
        return {
            schemaIdsToExclude: request.name == null ? [] : [request.name],
            value: {
                name: requestNameOverride ?? request.name ?? generatedRequestName,
                "path-parameters": pathParameters,
                "query-parameters": queryParameters,
                headers,
                body: {
                    properties
                },
                "content-type": MediaType.MULTIPART_FORM_DATA,
                ...(request.description ? { docs: request.description } : {})
            }
        };
    } else {
        assertNever(request);
    }
}

function endpointRequestSupportsInlinedPathParameters({
    context,
    request
}: {
    context: OpenApiIrConverterContext;
    request: Request | undefined;
}): boolean {
    if (!context.inlinePathParameters) {
        return false;
    }
    if (request == null) {
        return true;
    }
    switch (request.type) {
        case "octetStream":
            // octet-stream requests do not support named request wrappers,
            // so we can't inline path parameters for them.
            return false;
        case "multipart":
            return true;
        case "json":
            return true;
        default:
            assertNever(request);
    }
}
