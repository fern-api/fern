import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FullExample, FullOneOfExample, KeyValuePair, PrimitiveExample } from "@fern-fern/openapi-ir-model/example";
import {
    Endpoint,
    EndpointAvailability,
    EndpointExample,
    HttpError,
    Request,
    Response,
    Schema,
    SchemaId,
    StatusCode,
} from "@fern-fern/openapi-ir-model/ir";
import { ROOT_PREFIX } from "../convertPackage";
import { Environments } from "../getEnvironments";
import { convertHeader } from "./convertHeader";
import { convertPathParameter } from "./convertPathParameter";
import { convertQueryParameter } from "./convertQueryParameter";
import { convertToHttpMethod } from "./convertToHttpMethod";
import { convertToTypeReference } from "./convertToTypeReference";
import { getDocsFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface ConvertedEndpoint {
    value: RawSchemas.HttpEndpointSchema;
    schemaIdsToExclude: string[];
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertEndpoint({
    endpoint,
    isPackageYml,
    schemas,
    environments,
    nonRequestReferencedSchemas,
    globalHeaderNames,
    errors,
}: {
    endpoint: Endpoint;
    isPackageYml: boolean;
    schemas: Record<SchemaId, Schema>;
    environments: Environments | undefined;
    nonRequestReferencedSchemas: SchemaId[];
    globalHeaderNames: Set<string>;
    errors: Record<StatusCode, HttpError>;
}): ConvertedEndpoint {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    let schemaIdsToExclude: string[] = [];

    const names = new Set<string>();

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    for (const pathParameter of endpoint.pathParameters) {
        const convertedPathParameter = convertPathParameter({ pathParameter, schemas, isPackageYml });
        pathParameters[pathParameter.name] = convertedPathParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedPathParameter.additionalTypeDeclarations,
        };
        names.add(pathParameter.name);
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    for (const queryParameter of endpoint.queryParameters) {
        const convertedQueryParameter = convertQueryParameter({ queryParameter, isPackageYml, schemas });
        if (convertedQueryParameter == null) {
            // TODO(dsinghvi): HACKHACK we are just excluding certain query params from the SDK
            continue;
        }
        queryParameters[queryParameter.name] = convertedQueryParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedQueryParameter.additionalTypeDeclarations,
        };
        names.add(queryParameter.name);
    }

    const convertedEndpoint: RawSchemas.HttpEndpointSchema = {
        path: environments?.type === "single" ? `${environments.endpointPathPrefix}${endpoint.path}` : endpoint.path,
        method: convertToHttpMethod(endpoint.method),
        auth: endpoint.authed,
        docs: endpoint.description ?? undefined,
    };

    if (Object.keys(pathParameters).length > 0) {
        convertedEndpoint["path-parameters"] = pathParameters;
    }

    if (endpoint.summary != null) {
        convertedEndpoint["display-name"] = endpoint.summary;
    }

    const headers: Record<string, RawSchemas.HttpHeaderSchema> = {};
    const endpointSpecificHeaders = endpoint.headers.filter((header) => {
        return !globalHeaderNames.has(header.name);
    });
    for (const header of endpointSpecificHeaders) {
        const convertedHeader = convertHeader({ header, isPackageYml, schemas });
        headers[header.name] = convertedHeader.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedHeader.additionalTypeDeclarations,
        };
        names.add(header.name);
    }

    if (endpoint.request != null) {
        const convertedRequest = getRequest({
            isPackageYml,
            request: endpoint.request,
            schemas,
            generatedRequestName: endpoint.generatedRequestName,
            requestNameOverride: endpoint.requestNameOverride ?? undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
            nonRequestReferencedSchemas,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
            usedNames: names,
        });
        convertedEndpoint.request = convertedRequest.value;
        schemaIdsToExclude = [...schemaIdsToExclude, ...(convertedRequest.schemaIdsToExclude ?? [])];
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedRequest.additionalTypeDeclarations,
        };
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
                const responseTypeReference = convertToTypeReference({
                    schema: jsonResponse.schema,
                    prefix: isPackageYml ? undefined : ROOT_PREFIX,
                    schemas,
                });
                additionalTypeDeclarations = {
                    ...additionalTypeDeclarations,
                    ...responseTypeReference.additionalTypeDeclarations,
                };
                convertedEndpoint.response = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference.typeReference),
                };
            },
            streamingJson: (jsonResponse) => {
                const responseTypeReference = convertToTypeReference({
                    schema: jsonResponse.schema,
                    prefix: isPackageYml ? undefined : ROOT_PREFIX,
                    schemas,
                });
                additionalTypeDeclarations = {
                    ...additionalTypeDeclarations,
                    ...responseTypeReference.additionalTypeDeclarations,
                };
                convertedEndpoint["response-stream"] = {
                    docs: jsonResponse.description ?? undefined,
                    type: getTypeFromTypeReference(responseTypeReference.typeReference),
                };
            },
            file: (fileResponse) => {
                convertedEndpoint.response = {
                    docs: fileResponse.description ?? undefined,
                    type: "file",
                };
            },
            streamingText: (textResponse) => {
                convertedEndpoint["response-stream"] = {
                    docs: textResponse.description ?? undefined,
                    type: "text",
                };
            },
            text: (textResponse) => {
                convertedEndpoint.response = {
                    docs: textResponse.description ?? undefined,
                    type: "text",
                };
            },
            _unknown: () => {
                throw new Error("Unrecognized Response type: " + endpoint.response?.type);
            },
        });
    }

    if (environments?.type === "multi") {
        const serverOverride = endpoint.server[0];
        if (endpoint.server.length === 0) {
            convertedEndpoint.url = environments.defaultUrl;
        } else if (serverOverride != null) {
            convertedEndpoint.url = serverOverride.name ?? undefined;
        } else {
            throw new Error(
                `${endpoint.method} ${endpoint.path} can only have a single server override, but has more.`
            );
        }
    }

    if (endpoint.availability === EndpointAvailability.Beta) {
        convertedEndpoint.availability = "pre-release";
    } else if (endpoint.availability === EndpointAvailability.GenerallyAvailable) {
        convertedEndpoint.availability = "generally-available";
    } else if (endpoint.availability === EndpointAvailability.Deprecated) {
        convertedEndpoint.availability = "deprecated";
    }

    const errorsThrown: string[] = [];
    endpoint.errorStatusCode.forEach((statusCode) => {
        const errorName = errors[statusCode]?.generatedName;
        if (errorName != null) {
            errorsThrown.push(errorName);
        }
    });
    convertedEndpoint.errors = isPackageYml ? errorsThrown : errorsThrown.map((error) => `${ROOT_PREFIX}.${error}`);

    if (endpoint.examples.length > 0) {
        convertedEndpoint.examples = convertEndpointExamples(endpoint.examples);
    }

    return {
        value: convertedEndpoint,
        schemaIdsToExclude,
        additionalTypeDeclarations,
    };
}

interface NamedFullExample {
    name: string;
    value: FullExample;
}

function convertEndpointExamples(endpointExamples: EndpointExample[]): RawSchemas.ExampleEndpointCallSchema[] {
    return endpointExamples.map((endpointExample) => {
        return convertEndpointExample(endpointExample);
    });
}

function convertEndpointExample(endpointExample: EndpointExample): RawSchemas.ExampleEndpointCallSchema {
    return {
        "path-parameters":
            endpointExample.pathParameters != null && endpointExample.pathParameters.length > 0
                ? convertNamedFullExamplesToFerns(endpointExample.pathParameters)
                : undefined,
        "query-parameters":
            endpointExample.queryParameters != null && endpointExample.queryParameters.length > 0
                ? convertNamedFullExamplesToFerns(endpointExample.queryParameters)
                : undefined,
        headers:
            endpointExample.headers != null && endpointExample.headers.length > 0
                ? convertNamedFullExamplesToFerns(endpointExample.headers)
                : undefined,
        request: endpointExample.request != null ? convertFullExampleToFern(endpointExample.request) : undefined,
        response:
            endpointExample.response != null ? { body: convertFullExampleToFern(endpointExample.response) } : undefined,
    };
}

function convertNamedFullExamplesToFerns(
    namedFullExamples: NamedFullExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    namedFullExamples.map(
        (namedFullExample) => (result[namedFullExample.name] = convertFullExampleToFern(namedFullExample.value))
    );
    return result;
}

function convertFullExampleToFern(fullExample: FullExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (fullExample.type) {
        case "primitive":
            return convertPrimitiveExampleToFern(fullExample.primitive);
        case "object":
            return convertFullExamplePropertiesToFern(fullExample.properties);
        case "array":
            return convertFullArrayExampleToFern(fullExample.array);
        case "map":
            return convertFullMapExampleToFern(fullExample.map);
        case "oneOf":
            return convertFullOneOfExampleToFern(fullExample.oneOf);
        case "enum":
            return fullExample.enum;
        case "literal":
            return fullExample.literal;
        case "unknown":
            return convertFullExampleToFern(fullExample.unknown);
        default:
            assertNever(fullExample);
    }
}

function convertPrimitiveExampleToFern(primitiveExample: PrimitiveExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (primitiveExample.type) {
        case "int":
            return primitiveExample.int;
        case "int64":
            return primitiveExample.int64;
        case "float":
            return primitiveExample.float;
        case "double":
            return primitiveExample.double;
        case "string":
            return primitiveExample.string;
        case "datetime":
            return primitiveExample.datetime;
        case "date":
            return primitiveExample.date;
        case "base64":
            return primitiveExample.base64;
        case "boolean":
            return primitiveExample.boolean;
        default:
            assertNever(primitiveExample);
    }
}

function convertFullExamplePropertiesToFern(
    fullExampleProperties: Record<PropertyKey, FullExample>
): RawSchemas.ExampleTypeReferenceSchema {
    const properties: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    Object.entries(fullExampleProperties).forEach(
        ([propertyKey, fullExample]) => (properties[propertyKey] = convertFullExampleToFern(fullExample))
    );
    return properties;
}

function convertFullArrayExampleToFern(fullExamples: FullExample[]): RawSchemas.ExampleTypeReferenceSchema {
    return fullExamples.map((fullExample) => {
        return convertFullExampleToFern(fullExample);
    });
}

function convertFullMapExampleToFern(pairs: KeyValuePair[]): RawSchemas.ExampleTypeReferenceSchema {
    return pairs.map((pair) => {
        return [convertPrimitiveExampleToFern(pair.key), convertFullExampleToFern(pair.value)];
    });
}

function convertFullOneOfExampleToFern(oneOf: FullOneOfExample): RawSchemas.ExampleTypeReferenceSchema {
    if (oneOf.type === "discriminated") {
        return convertFullExamplePropertiesToFern(oneOf.discriminated);
    }
    return convertFullExampleToFern(oneOf.undisciminated);
}

interface ConvertedRequest {
    value: RawSchemas.HttpRequestSchema;
    schemaIdsToExclude?: string[];
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

function getRequest({
    isPackageYml,
    request,
    schemas,
    requestNameOverride,
    generatedRequestName,
    queryParameters,
    nonRequestReferencedSchemas,
    headers,
    usedNames,
}: {
    isPackageYml: boolean;
    request: Request;
    schemas: Record<SchemaId, Schema>;
    requestNameOverride?: string;
    generatedRequestName: string;
    queryParameters?: Record<string, RawSchemas.HttpQueryParameterSchema>;
    nonRequestReferencedSchemas: SchemaId[];
    headers?: Record<string, RawSchemas.HttpHeaderSchema>;
    usedNames: Set<string>;
}): ConvertedRequest {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    if (request.type === "json") {
        const maybeSchemaId = request.schema.type === "reference" ? request.schema.schema : undefined;
        const resolvedSchema = request.schema.type === "reference" ? schemas[request.schema.schema] : request.schema;
        if (resolvedSchema == null) {
            throw Error(`Failed to resolve schema ${JSON.stringify(request.schema)}`);
        }

        // the request body is referenced if it is not an object or if other parts of the spec
        // refer to the same type
        if (
            resolvedSchema.type !== "object" ||
            (maybeSchemaId != null && nonRequestReferencedSchemas.includes(maybeSchemaId))
        ) {
            const requestTypeReference = convertToTypeReference({
                schema: resolvedSchema,
                prefix: isPackageYml ? undefined : ROOT_PREFIX,
                schemas,
            });
            const convertedRequest: ConvertedRequest = {
                schemaIdsToExclude: [],
                value: {
                    body:
                        typeof requestTypeReference === "string"
                            ? requestTypeReference
                            : requestTypeReference.typeReference,
                },
                additionalTypeDeclarations: {
                    ...additionalTypeDeclarations,
                    ...requestTypeReference.additionalTypeDeclarations,
                },
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
                const propertyTypeReference = convertToTypeReference({
                    schema: property.schema,
                    prefix: isPackageYml ? undefined : ROOT_PREFIX,
                    schemas,
                });
                additionalTypeDeclarations = {
                    ...additionalTypeDeclarations,
                    ...propertyTypeReference.additionalTypeDeclarations,
                };
                return [
                    property.key,
                    usedNames.has(property.key)
                        ? {
                              type: getTypeFromTypeReference(propertyTypeReference.typeReference),
                              docs: getDocsFromTypeReference(propertyTypeReference.typeReference),
                              name: property.generatedName,
                          }
                        : propertyTypeReference.typeReference,
                ];
            })
        );
        const extendedSchemas: string[] = resolvedSchema.allOf.map((referencedSchema) => {
            const allOfTypeReference = convertToTypeReference({
                schema: Schema.reference(referencedSchema),
                prefix: isPackageYml ? undefined : ROOT_PREFIX,
                schemas,
            });
            additionalTypeDeclarations = {
                ...additionalTypeDeclarations,
                ...allOfTypeReference.additionalTypeDeclarations,
            };
            return getTypeFromTypeReference(allOfTypeReference.typeReference);
        });
        const requestBodySchema: RawSchemas.HttpRequestBodySchema = {
            properties,
        };
        if (extendedSchemas.length > 0) {
            requestBodySchema.extends = extendedSchemas;
        }

        const convertedRequestValue: RawSchemas.HttpRequestSchema = {
            name: requestNameOverride ?? resolvedSchema.nameOverride ?? resolvedSchema.generatedName,
            "query-parameters": queryParameters,
            headers,
            body: requestBodySchema,
        };
        if (request.contentType != null) {
            convertedRequestValue["content-type"] = request.contentType;
        }
        return {
            schemaIdsToExclude: maybeSchemaId != null ? [maybeSchemaId] : [],
            value: convertedRequestValue,
            additionalTypeDeclarations,
        };
    } else if (request.type === "octetStream") {
        return {
            schemaIdsToExclude: [],
            value: {
                body: "bytes",
                "content-type": "application/octet-stream",
            },
            additionalTypeDeclarations: {},
        };
    } else {
        // multipart
        const properties = Object.fromEntries(
            request.properties.map((property) => {
                if (property.schema.type === "file") {
                    return [property.key, "file"];
                } else {
                    const propertyTypeReference = convertToTypeReference({
                        schema: property.schema.json,
                        prefix: isPackageYml ? undefined : ROOT_PREFIX,
                        schemas,
                    });
                    additionalTypeDeclarations = {
                        ...additionalTypeDeclarations,
                        ...propertyTypeReference.additionalTypeDeclarations,
                    };
                    return [property.key, propertyTypeReference.typeReference];
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
                    properties,
                },
            },
            additionalTypeDeclarations,
        };
    }
}
