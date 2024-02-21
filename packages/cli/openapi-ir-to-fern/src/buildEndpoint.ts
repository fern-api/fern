import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import {
    Endpoint,
    EndpointAvailability,
    EndpointExample,
    Request,
    Response,
    Schema
} from "@fern-fern/openapi-ir-model/finalIr";
import { buildEndpointExample } from "./buildEndpointExample";
import { ERROR_DECLARATIONS_FILENAME, EXTERNAL_AUDIENCE } from "./buildFernDefinition";
import { buildHeader } from "./buildHeader";
import { buildPathParameter } from "./buildPathParameter";
import { buildQueryParameter } from "./buildQueryParameter";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { convertToHttpMethod } from "./utils/convertToHttpMethod";
import { getDocsFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

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
    const { errors, nonRequestReferencedSchemas } = context.ir;

    let schemaIdsToExclude: string[] = [];

    const names = new Set<string>();

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    for (const pathParameter of endpoint.pathParameters) {
        pathParameters[pathParameter.name] = buildPathParameter({
            pathParameter,
            context,
            fileContainingReference: declarationFile
        });
        names.add(pathParameter.name);
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    for (const queryParameter of endpoint.queryParameters) {
        const convertedQueryParameter = buildQueryParameter({
            queryParameter,
            context,
            fileContainingReference: declarationFile
        });
        if (convertedQueryParameter == null) {
            // TODO(dsinghvi): HACKHACK we are just excluding certain query params from the SDK
            continue;
        }
        queryParameters[queryParameter.name] = convertedQueryParameter;
        names.add(queryParameter.name);
    }

    const convertedEndpoint: RawSchemas.HttpEndpointSchema = {
        path: endpoint.path,
        method: convertToHttpMethod(endpoint.method),
        auth: endpoint.authed,
        docs: endpoint.description ?? undefined
    };

    if (Object.keys(pathParameters).length > 0) {
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
        const headerSchema = buildHeader({ header, context, fileContainingReference: declarationFile });
        headers[header.name] = headerSchema;
        names.add(typeof headerSchema === "string" ? header.name : headerSchema.name ?? header.name);
    }

    if (endpoint.request != null) {
        const convertedRequest = getRequest({
            context,
            declarationFile,
            request: endpoint.request,
            generatedRequestName: endpoint.generatedRequestName,
            requestNameOverride: endpoint.requestNameOverride ?? undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
            nonRequestReferencedSchemas,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            usedNames: names
        });
        convertedEndpoint.request = convertedRequest.value;
        schemaIdsToExclude = [...schemaIdsToExclude, ...(convertedRequest.schemaIdsToExclude ?? [])];
    } else {
        const hasQueryParams = Object.keys(queryParameters).length > 0;
        const hasHeaders = Object.keys(headers).length > 0;

        const convertedRequest: RawSchemas.HttpRequestSchema = {};

        if (hasQueryParams || hasHeaders) {
            convertedRequest.name = endpoint.requestNameOverride ?? endpoint.generatedRequestName;
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
        Response._visit(endpoint.response, {
            json: (jsonResponse) => {
                const responseTypeReference = buildTypeReference({
                    schema: jsonResponse.schema,
                    context,
                    fileContainingReference: declarationFile
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
                    fileContainingReference: declarationFile
                });
                convertedEndpoint["response-stream"] = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference)
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
            _unknown: () => {
                throw new Error("Unrecognized Response type: " + endpoint.response?.type);
            }
        });
    }

    if (context.builder.getEnvironmentType() === "multi") {
        const serverOverride = endpoint.server[0];
        if (serverOverride == null) {
            convertedEndpoint.url = context.getOrThrowDefaultServerName();
        } else {
            convertedEndpoint.url = serverOverride.name ?? undefined;
        }
    }

    if (endpoint.availability === EndpointAvailability.Beta) {
        convertedEndpoint.availability = "pre-release";
    } else if (endpoint.availability === EndpointAvailability.GenerallyAvailable) {
        convertedEndpoint.availability = "generally-available";
    } else if (endpoint.availability === EndpointAvailability.Deprecated) {
        convertedEndpoint.availability = "deprecated";
    }

    endpoint.errorStatusCode.forEach((statusCode) => {
        const errorName = errors[statusCode]?.generatedName;
        if (errorName != null) {
            if (convertedEndpoint.errors == null) {
                convertedEndpoint.errors = [];
            }
            const prefix = context.builder.addImport({
                file: declarationFile,
                fileToImport: ERROR_DECLARATIONS_FILENAME
            });
            convertedEndpoint.errors.push(prefix != null ? `${prefix}.${errorName}` : errorName);
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
    declarationFile,
    context,
    request,
    requestNameOverride,
    generatedRequestName,
    queryParameters,
    nonRequestReferencedSchemas,
    headers,
    usedNames
}: {
    declarationFile: RelativeFilePath;
    context: OpenApiIrConverterContext;
    request: Request;
    requestNameOverride?: string;
    generatedRequestName: string;
    queryParameters?: Record<string, RawSchemas.HttpQueryParameterSchema>;
    nonRequestReferencedSchemas: SchemaId[];
    headers?: Record<string, RawSchemas.HttpHeaderSchema>;
    usedNames: Set<string>;
}): ConvertedRequest {
    if (request.type === "json") {
        const maybeSchemaId = request.schema.type === "reference" ? request.schema.schema : undefined;
        const resolvedSchema =
            request.schema.type === "reference" ? context.getSchema(request.schema.schema) : request.schema;
        // the request body is referenced if it is not an object or if other parts of the spec
        // refer to the same type
        if (
            resolvedSchema.type !== "object" ||
            (maybeSchemaId != null && nonRequestReferencedSchemas.includes(maybeSchemaId))
        ) {
            const requestTypeReference = buildTypeReference({
                schema: request.schema,
                fileContainingReference: declarationFile,
                context
            });
            const convertedRequest: ConvertedRequest = {
                schemaIdsToExclude: [],
                value: {
                    body: requestTypeReference
                }
            };

            const hasQueryParams = Object.keys(queryParameters ?? {}).length > 0;
            const hasHeaders = Object.keys(headers ?? {}).length > 0;

            if (hasQueryParams) {
                convertedRequest.value["query-parameters"] = queryParameters;
            }
            if (hasHeaders) {
                convertedRequest.value.headers = headers;
            }
            if (hasQueryParams || hasHeaders) {
                convertedRequest.value.name = requestNameOverride ?? generatedRequestName;
            }

            if (request.contentType != null) {
                convertedRequest.value["content-type"] = request.contentType;
            }

            return convertedRequest;
        }
        const properties = Object.fromEntries(
            resolvedSchema.properties.map((property) => {
                const propertyTypeReference = buildTypeReference({
                    schema: property.schema,
                    fileContainingReference: declarationFile,
                    context
                });

                if (!usedNames.has(property.key) && property.audiences.length <= 0) {
                    return [property.key, propertyTypeReference];
                }

                const typeReference: RawSchemas.ObjectPropertySchema = {
                    type: getTypeFromTypeReference(propertyTypeReference),
                    docs: getDocsFromTypeReference(propertyTypeReference)
                };

                if (usedNames.has(property.key)) {
                    typeReference.name = property.generatedName;
                }

                if (property.audiences.length > 0) {
                    typeReference.audiences = property.audiences;
                }

                return [property.key, typeReference];
            })
        );
        const extendedSchemas: string[] = resolvedSchema.allOf.map((referencedSchema) => {
            const allOfTypeReference = buildTypeReference({
                schema: Schema.reference(referencedSchema),
                fileContainingReference: declarationFile,
                context
            });
            return getTypeFromTypeReference(allOfTypeReference);
        });
        const requestBodySchema: RawSchemas.HttpRequestBodySchema = {
            properties
        };
        if (extendedSchemas.length > 0) {
            requestBodySchema.extends = extendedSchemas;
        }

        const convertedRequestValue: RawSchemas.HttpRequestSchema = {
            name: requestNameOverride ?? resolvedSchema.nameOverride ?? resolvedSchema.generatedName,
            "query-parameters": queryParameters,
            headers,
            body: requestBodySchema
        };
        if (request.contentType != null) {
            convertedRequestValue["content-type"] = request.contentType;
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
                "content-type": "application/octet-stream"
            }
        };
    } else {
        // multipart
        const properties = Object.fromEntries(
            request.properties.map((property) => {
                if (property.schema.type === "file") {
                    const fileType = property.schema.isArray ? "list<file>" : "file";
                    return [property.key, property.schema.isOptional ? `optional<${fileType}>` : fileType];
                } else {
                    const propertyTypeReference = buildTypeReference({
                        schema: property.schema.json,
                        fileContainingReference: declarationFile,
                        context
                    });
                    return [property.key, propertyTypeReference];
                }
            })
        );
        return {
            schemaIdsToExclude: request.name == null ? [] : [request.name],
            value: {
                name: requestNameOverride ?? request.name ?? generatedRequestName,
                "query-parameters": queryParameters,
                headers,
                body: {
                    properties
                }
            }
        };
    }
}
