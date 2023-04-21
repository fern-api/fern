import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint, Request, Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { ROOT_PREFIX } from "../convert";
import { convertPathParameter } from "./convertPathParameter";
import { convertQueryParameter } from "./convertQueryParameter";
import { convertToHttpMethod } from "./convertToHttpMethod";
import { convertToTypeReference } from "./convertToTypeReference";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface ConvertedEndpoint {
    value: RawSchemas.HttpEndpointSchema;
    schemaIdsToExclude: string[];
}

export function convertEndpoint({
    endpoint,
    isPackageYml,
    schemas,
}: {
    endpoint: Endpoint;
    isPackageYml: boolean;
    schemas: Record<SchemaId, Schema>;
}): ConvertedEndpoint {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    let schemaIdsToExclude: string[] = [];

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    for (const pathParameter of endpoint.pathParameters) {
        const convertedPathParameter = convertPathParameter(pathParameter);
        pathParameters[pathParameter.name] = convertedPathParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedPathParameter.additionalTypeDeclarations,
        };
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    for (const queryParameter of endpoint.queryParameters) {
        const convertedQueryParameter = convertQueryParameter(queryParameter);
        queryParameters[queryParameter.name] = convertedQueryParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedQueryParameter.additionalTypeDeclarations,
        };
    }

    const convertedEndpoint: RawSchemas.HttpEndpointSchema = {
        path: endpoint.path,
        method: convertToHttpMethod(endpoint.method),
    };

    if (Object.keys(pathParameters).length > 0) {
        convertedEndpoint["path-parameters"] = pathParameters;
    }

    if (endpoint.request != null) {
        const convertedRequest = getRequest({
            request: endpoint.request,
            schemas,
            requestName: endpoint.requestName ?? undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
        });
        convertedEndpoint.request = convertedRequest.value;
        schemaIdsToExclude = [...schemaIdsToExclude, ...(convertedRequest.schemaIdsToExclude ?? [])];
    } else if (Object.keys(queryParameters).length > 0) {
        if (endpoint.requestName == null) {
            throw new Error(`x-request-name is required for endpoint ${JSON.stringify(endpoint)}`);
        }
        convertedEndpoint.request = {
            name: endpoint.requestName,
            "query-parameters": queryParameters,
        };
    }

    if (endpoint.response != null) {
        const responseTypeReference = convertToTypeReference({
            schema: endpoint.response.schema,
            prefix: isPackageYml ? undefined : ROOT_PREFIX,
        });
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...responseTypeReference.additionalTypeDeclarations,
        };
        convertedEndpoint.response = {
            docs: endpoint.response.description ?? undefined,
            type: getTypeFromTypeReference(responseTypeReference.typeReference),
        };
    }
    return {
        value: convertedEndpoint,
        schemaIdsToExclude,
    };
}

interface ConvertedRequest {
    value: RawSchemas.HttpRequestSchema;
    schemaIdsToExclude?: string[];
}

function getRequest({
    request,
    schemas,
    requestName,
    queryParameters,
}: {
    request: Request;
    schemas: Record<SchemaId, Schema>;
    requestName?: string;
    queryParameters?: Record<string, RawSchemas.HttpQueryParameterSchema>;
}): ConvertedRequest {
    if (request.type === "json") {
        if (request.schema.type !== "reference") {
            throw Error("Only request references are currently supported");
        }
        const schema = schemas[request.schema.reference];
        if (schema == null) {
            throw Error(`Failed to resolve schema reference ${request.schema.reference}`);
        }
        if (schema.type !== "object") {
            throw Error(`Request ${request.schema.reference} must be object ${JSON.stringify(schema)}`);
        }
        return {
            schemaIdsToExclude: [request.schema.reference],
            value: {
                name: requestName ?? request.schema.reference,
                "query-parameters": queryParameters,
                body: {
                    properties: Object.fromEntries(
                        schema.properties.map((property) => {
                            const propertyTypeReference = convertToTypeReference({ schema: property.schema });
                            return [property.key, propertyTypeReference.typeReference];
                        })
                    ),
                },
            },
        };
    } else {
        // multipart
        if (requestName == null) {
            throw new Error(`x-request-name is required for multipart request ${JSON.stringify(request)}`);
        }
        return {
            schemaIdsToExclude: [requestName],
            value: {
                name: requestName,
                "query-parameters": queryParameters,
                body: {
                    properties: Object.fromEntries(
                        request.properties.map((property) => {
                            if (property.schema.type === "file") {
                                return [property.key, "file"];
                            } else {
                                const propertyTypeReference = convertToTypeReference({ schema: property.schema.json });
                                return [property.key, propertyTypeReference.typeReference];
                            }
                        })
                    ),
                },
            },
        };
    }
}
