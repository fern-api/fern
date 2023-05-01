import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint, Request, Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { ROOT_PREFIX } from "../convertPackage";
import { Environment } from "../getEnvironment";
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
    environment,
}: {
    endpoint: Endpoint;
    isPackageYml: boolean;
    schemas: Record<SchemaId, Schema>;
    environment: Environment | undefined;
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
        const convertedQueryParameter = convertQueryParameter({ queryParameter, isPackageYml });
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
            generatedRequestName: endpoint.generatedRequestName,
            requestNameOverride: endpoint.requestNameOverride ?? undefined,
            queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
        });
        convertedEndpoint.request = convertedRequest.value;
        schemaIdsToExclude = [...schemaIdsToExclude, ...(convertedRequest.schemaIdsToExclude ?? [])];
    } else if (Object.keys(queryParameters).length > 0) {
        convertedEndpoint.request = {
            name: endpoint.requestNameOverride ?? endpoint.generatedRequestName,
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

    if (environment?.type === "multi") {
        const serverOverride = endpoint.server[0];
        if (endpoint.server.length === 0) {
            convertedEndpoint.url = environment.defaultUrl;
        } else if (serverOverride != null) {
            convertedEndpoint.url = serverOverride.name ?? undefined;
        } else {
            throw new Error(
                `${endpoint.method} ${endpoint.path} can only have a single server override, but has more.`
            );
        }
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
    requestNameOverride,
    generatedRequestName,
    queryParameters,
}: {
    request: Request;
    schemas: Record<SchemaId, Schema>;
    requestNameOverride?: string;
    generatedRequestName: string;
    queryParameters?: Record<string, RawSchemas.HttpQueryParameterSchema>;
}): ConvertedRequest {
    if (request.type === "json") {
        if (request.schema.type !== "reference") {
            throw Error("Only request references are currently supported");
        }
        const schema = schemas[request.schema.schema];
        if (schema == null) {
            throw Error(`Failed to resolve schema reference ${request.schema.schema}`);
        }
        if (schema.type !== "object") {
            const requestTypeReference = convertToTypeReference({ schema });

            const convertedRequest: ConvertedRequest = {
                schemaIdsToExclude: [request.schema.schema],
                value: {
                    body:
                        typeof requestTypeReference === "string"
                            ? requestTypeReference
                            : requestTypeReference.typeReference,
                },
            };

            if (Object.keys(queryParameters ?? {}).length > 0) {
                convertedRequest.value.name = requestNameOverride ?? generatedRequestName;
                convertedRequest.value["query-parameters"] = queryParameters;
            }

            return convertedRequest;
        }
        return {
            schemaIdsToExclude: [request.schema.schema],
            value: {
                name: requestNameOverride ?? schema.nameOverride ?? schema.generatedName,
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
        return {
            schemaIdsToExclude: request.name == null ? [] : [request.name],
            value: {
                name: requestNameOverride ?? request.name ?? generatedRequestName,
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
